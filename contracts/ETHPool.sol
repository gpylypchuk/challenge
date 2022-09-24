//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Ether Pool
 * @author Geronimo Pylypchuk
 *
 * @dev Challenge Solution for Exactly Finance
 *
 * @dev ETHPool contract is used to let users
 * of Ethereum Blockchain deposit their Ethers
 * and EARN rewards "weekly" or when TEAM_MEMBERS
 * deposits to the pool of users the reward.
 */

contract ETHPool is AccessControl {
  /************************ 
  ======== EVENTS ========
  *************************/

  event Withdrew(bool success, bytes data, uint256 amount);

  event Deposited(bool success, uint256 amount);

  /************************ 
  ==== STATE VARIABLES ====
  *************************/

  bytes32 private constant TEAM_MEMBER = keccak256("TEAM_MEMBER");

  // Pool value without rewards
  uint256 private _pool;

  // Acumulator of times that TEAM_MEMBER deposited rewards.
  uint256 private _counter;

  // Sets the last date that a TEAM_MEMBER deposited rewards.
  uint256 private _dateRewarded;

  // Total rewards distributed (without withdraws)
  uint256 private _totalRewards;

  // Balances of users by their address
  mapping(address => uint256) public balance;

  // Tracks by index of _counter the reward sent by TEAM_MEMBER
  mapping(uint256 => uint256) private _reward;

  // Adds value deposited after the TEAM_MEMBER deposited rewards.
  mapping(address => mapping(uint256 => uint256)) private _notRewarded;

  // Sets the _counter linked to User address (first time deposited)
  mapping(address => uint256) private _since;

  /********************** 
  ===== CONSTRUCTOR =====
  ***********************/

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(TEAM_MEMBER, msg.sender);
  }

  /*********************** 
  === PUBLIC FUNCTIONS ===
  ************************/

  /// @notice Users can deposit Ether only with this function.
  function deposit() public payable {
    // Deposit Ether must be greater than zero.
    require(msg.value > 0, "Deposit: send more than 0 ether");

    // Sets the first time the user deposited (even if withdrawed).
    if (balance[msg.sender] == 0) _since[msg.sender] = _counter;

    // Increments balance by value sent by user.
    balance[msg.sender] += msg.value;

    // Accumulates the balance deposited after reward deposit.
    if (block.timestamp > _dateRewarded)
      _notRewarded[msg.sender][_counter] += msg.value;

    emit Deposited(true, msg.value);
  }

  /**
   * @dev This function ables to users
   * withdraw all their balances plus their earned
   * Ether if they participated in distributed rewards
   */
  function withdraw() public {
    /**
     * @notice Saves balance, then sets to zero user balance
     * (eviting reentrance hacks).
     */
    uint256 amount = balance[msg.sender];
    balance[msg.sender] = 0;

    // Validation balance have to be greater than zero.
    require(amount > 0, "Withdraw: Nothing to withdraw");

    /**
     * @notice Saves the times that the user has participated
     * in rewards sent by TEAM_MEMBERS
     */
    uint256 rewardsParticipated = _counter - _since[msg.sender];

    if (rewardsParticipated > 0) {
      // Balance without not rewarded balance (deposits after reward deposit)
      uint256 reward;

      /**
       * @dev Adds to reward variable every time between
       * last deposit reward and rewards user have participated.
       * @notice Critical for gas fees (in charge of the user)
       * @notice Lineal complexity O(n)
       */
      unchecked {
        uint256 index = _counter;
        while (rewardsParticipated > 0) {
          reward += _reward[index];
          assembly {
            // rewardsParticipated--
            rewardsParticipated := sub(1, rewardsParticipated)
            // index--
            index := sub(1, index)
          }
        }
      }

      /**
       * @dev Calculate the percentage -> BALANCE / POOL
       *
       * @dev Then, calculate user's portion of rewards
       * by multipling the rewards by percentage
       * like that -> TotalRewards * Percentage
       * E.g. I participated in 2 rewards, therefore,
       * the total rewards were 200 wei and my participation
       * in the total pool balance deposited is 25%,
       * my earned amount will be 200 wei * 25% = 50 wei
       *
       * @dev Finally, this amount earned is added to the
       * original balance of user. E.g. My 50 wei plus my original
       * balance that I deposited in pool -> 50 wei + 100 wei.
       */
      uint256 validBalance = amount - _notRewarded[msg.sender][_counter];
      uint256 percentage = (validBalance * (_pool * 1 ether)) / _pool;
      uint256 earned = (reward * percentage) / (_pool * 1 ether);

      _totalRewards -= earned;

      amount = amount + earned;
    }

    // Transfers the total earned plus the balance of user
    (bool success, bytes memory data) = payable(msg.sender).call{
      value: amount
    }("");

    emit Withdrew(success, data, amount);
  }

  /**
   * @dev TEAM_MEMBER Function for deposit rewards in Pool of Users.
   */
  function depositRewards() public payable onlyRole(TEAM_MEMBER) {
    unchecked {
      assembly {
        sstore(_counter.slot, add(1, sload(_counter.slot))) // _counter++
      }
    }

    _dateRewarded = block.timestamp;
    _reward[_counter] = msg.value;
    _totalRewards += msg.value;

    // Pool is equal total balance in address discounting rewards
    _pool = address(this).balance - _totalRewards;
  }

  /**
   * @dev This receive function with revert evits dust ether or
   * possibles kill hacks.
   */
  receive() external payable {
    revert("No Receive: Only with Deposit function");
  }
}
