// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

/*
 *  @Dev @gpylypchuk
 *  @Challenge for Exactly Finance
 *
 *  With this contract you can deposit
 *  Ethers and Earn Rewards by staking
 *  at least 7 days.
*/

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ETHPool is AccessControl {

    event Received(address indexed addr, uint256 amount);
    event Sent(address indexed addr, uint256 amount);

    /* 
     * For @testing purposes you can set the 
     * accounts and poolValue to PUBLIC.
    */
    bytes32 public constant TEAM_MEMBER = keccak256("TEAM_MEMBER");
    uint256 private constant time = 7 days;
    address [] private accounts;
    uint256 private poolValue;

    struct User {
        uint256 valueDeposited;
        uint256 startDate;
        bool staking;
        bool newUser;
    }

    /*
     @testing same, we can put users to PUBLIC.  
    */
    mapping(address => User) private users;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEAM_MEMBER, msg.sender);
    }

    // This contract Receives Ether to Stake in ETHPool.

    receive() external payable {
        require(msg.value > 0, "You have to deposit at least 1 wei.");
        if(!(users[msg.sender].newUser)) accounts.push(msg.sender);
        User storage user = users[msg.sender];
        user.valueDeposited += msg.value;
        user.startDate += block.timestamp;
        user.staking = true;
        user.newUser = true;
        poolValue += msg.value;
    }

    // Deposit Rewards Earned with Staking in ETHPool.

    function depositRewards(uint256 earned)
    onlyRole(TEAM_MEMBER) 
    public 
    returns (bool withdrawed) {
        bool success = _deposit(earned);
        return success;
    }

    /*
     * For @testing purposes you can remove the require
     * because it is not in production
     * but poolValue HAS TO BE EQUAL TO address(this).balance!
     * In other forms we can Steal money from our users.
     * By other hand, in this contract users will always trust us,
     * because we can always change fees -> stable finance?
    */

    function _deposit(uint256 _amount)
    private 
    returns (bool success) {
        poolValue += _amount;
        uint256 thisBalance =  address(this).balance;
        require(poolValue == thisBalance, "PoolValue is not equal to The POOL VALUE!");
        for(uint256 i = 0; i < accounts.length; i++) {
            address user = accounts[i];
            uint256 valueUser = users[user].valueDeposited;
            uint256 percentage = valueUser / poolValue;
            uint256 reward = _amount * percentage;
            uint256 nowTime = block.timestamp;
            uint256 endTime = users[user].startDate + time;
            if(nowTime >= endTime) users[user].valueDeposited += reward;
        }
        return true;
    }

    function getPoolValue() public view returns (uint256) {
        return address(this).balance;
    }

    /*
     * @Users Can retire their Ethers:
     * If Users have not been staking for
     * more than 7 days their retire will be
     * without their "earns". But their initial
     * deposites can be retired.
    */

    function retireMyEther(address payable to, uint256 amount)
    public
    returns (bool success) {
        User storage user = users[msg.sender];
        uint256 value = user.valueDeposited;
        require(amount <= value, "You Cannot withdraw more Ether than you Deposited.");
        to.transfer(amount);
        user.valueDeposited -= amount;
        if(user.valueDeposited == 0) user.staking = false;
        poolValue -= amount;
        emit Sent(msg.sender, amount);
        return true;
    }

    // Team Members Functions (Add and Remove).

    function addTeamMember(address account)
    public 
    onlyRole(TEAM_MEMBER) {
        grantRole(TEAM_MEMBER, account);
    }

    function removeTeamMember(address account) 
    public
    onlyRole(TEAM_MEMBER) {
        revokeRole(TEAM_MEMBER, account);
    }

}