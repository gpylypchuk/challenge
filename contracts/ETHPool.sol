// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
 *  @dev @gpylypchuk
 *  @challenge for Exactly Finance
 *
 *  This contract allows to you Deposit Ethers
 *  and Earn Rewards by Staking them by 7 days.
 *  Also you can retire your Ethers when you want.   
*/

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ETHPool is AccessControl {

    event Received(address indexed addr, uint256 amount);
    event Sent(address indexed addr, uint256 amount);
    event Deposited(bool success, uint256 amount);

    bytes32 public constant TEAM_MEMBER = keccak256("TEAM_MEMBER");
    uint256 public constant time = 7 days;
    address [] public accounts;

    struct User {
        uint256 valueDeposited;
        uint256 startDate;
        bool newUser;
    }

    mapping(address => User) public users;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEAM_MEMBER, msg.sender);
    }

    receive() external payable {
        require(msg.value > 0, "You have to deposit at least 1 wei.");
        if(!(users[msg.sender].newUser)) accounts.push(msg.sender);
        User storage user = users[msg.sender];
        user.valueDeposited += msg.value;
        user.startDate = block.timestamp;
        user.newUser = true;
        emit Received(msg.sender, msg.value);
    }

    // @param -> amount gained staking in ETHPool
    function depositRewards(uint256 earned)
    onlyRole(TEAM_MEMBER)
    public {
        bool success = _deposit(earned);
        require(success, "Contract could not deposit rewards.");
        emit Deposited(success, earned);
    }

    function _deposit(uint256 _amount)
    private 
    returns (bool success) {
        uint256 pool = address(this).balance;
        for(uint256 i = 0; i < accounts.length; i++) {
            address user = accounts[i];
            uint256 valueUser = users[user].valueDeposited;
            uint256 percentage = valueUser * 1 ether / pool;
            uint256 reward = _amount * percentage / 1 ether;
            uint256 nowTime = block.timestamp;
            uint256 endTime = users[user].startDate + time;
            if(nowTime > endTime) users[user].valueDeposited += reward;
        }
        return true;
    }

    // @param -> address of user to transfer and amount (Retire Ethers in Account)
    function retireMyEther(address payable to, uint256 amount)
    public {
        uint256 value = users[msg.sender].valueDeposited;
        require(amount <= value, "You Cannot withdraw more Ether than you Deposited.");
        to.transfer(amount);
        users[msg.sender].valueDeposited -= amount;
        emit Sent(msg.sender, amount);
    }

    function getPoolValue() public view returns (uint256) {
        return address(this).balance;
    }

    // Access Control Functions (Add and Remove Team Members)
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