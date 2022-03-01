// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
* @title Ethereum Pool
* @author Geronimo Pylypchuk
*
* @dev Ethereum Pool is a smart contract that allows users to earn Ether.
* To earn Ether, users can deposit Ether to the smart contract. And then,
* when a Team Member deposits Rewards, claim it and withdraw the Ether earned.
*/

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ETHPool is AccessControl {

    /**
    * @notice Some events for tracking data.
    */
    event Deposited(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    /**
    * @dev Team member role who has access to depositRewards function
    */
    bytes32 private constant TEAM_MEMBER = keccak256("TEAM_MEMBER");

    /**
    * @notice rewardsDate is the date when the rewards are distributed
    * @notice rewards are the amount of Last Time Deposited Rewards
    * @notice poolValueMoment is the Pool Value when Deposited Rewards
    */
    uint256 public rewardsDate;
    uint256 public rewards;
    uint256 public poolValueMoment;

    /**
    * @notice balances are the amount of Ether deposited of each user in the pool
    * @notice depositedDate is the date of the last deposit of each user
    */
    mapping(address => uint256) public balances;
    mapping(address => uint256) public depositDate;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEAM_MEMBER, msg.sender);
    }

    /**
    * @notice When User deposits increments his balance
    * @notice When User deposits his deposit Date is the current Block Timestamp
    */
    receive() payable external {
        balances[msg.sender] += msg.value;
        depositDate[msg.sender] = block.timestamp;
        emit Deposited(msg.sender, msg.value);
    }

    /**
    * @dev TEAM_MEMBER role can deposit Rewards to the Pool by sending
    * Ether to the smart contract (calling this payable function).
    */
    function depositRewards() onlyRole(TEAM_MEMBER) payable public {
        rewardsDate = block.timestamp;
        rewards = msg.value;
        poolValueMoment = address(this).balance - rewards;
    }

    /**
    * @dev For complexity purposes O(1), the user have to claim his Rewards
    * by calling this function. Theorically has 1 week to do this.
    *
    * @dev For calculating Rewards First we do (100 * MyDeposit) / TotalDeposits = Percentage
    * Then we have to multiply Percentage by Rewards to get the amount of Rewards that user will get.
    * So, (Percentage * Rewards) / 100 = Amount of Rewards that user will get.
    */
    function claimRewards() public {
        require(depositDate[msg.sender] <= rewardsDate, "Can not claim rewards before deposit");
        depositDate[msg.sender] = block.timestamp;
        uint256 reward = (((100 * balances[msg.sender] * 1 ether) / (poolValueMoment * 1 ether)) * rewards) / 100;
        balances[msg.sender] += reward;
        emit RewardsClaimed(msg.sender, reward);
    }

    /**
    * @notice With this function all user can withdraw their Ether (including Rewards)
    */
    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Not enough funds");
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    }
    
    /**
    * @return the amount of Ether deposited in the Pool
    */
    function poolValue() public view returns (uint256) {
        return address(this).balance;
    }

}