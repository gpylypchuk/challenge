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
    event Deposited(bool success);

    bytes32 private constant TEAM_MEMBER = keccak256("TEAM_MEMBER");
    uint256 private constant time = 7 days;
    uint256 private pool;
    address [] private accounts;

    struct User {
        uint256 valueDeposited;
        uint256 startDate;
        bool newUser;
    }

    mapping(address => User) private users;

    constructor() {
        _setupRole(TEAM_MEMBER, msg.sender);
    }

    receive() external payable {
        require(msg.value > 0);
        User storage user = users[msg.sender];
        if(!(user.newUser)) accounts.push(msg.sender);
        user.valueDeposited += msg.value;
        user.startDate = block.timestamp;
        user.newUser = true;
        emit Received(msg.sender, msg.value);
    }

    // @param -> amount gained staking in ETHPool
    // From O(n) Lineal to O(1) Distribution Rewards -> Less Computacional Complexity
    function depositRewards() onlyRole(TEAM_MEMBER) public {
        pool = address(this).balance;
        emit Deposited(true);
    }

    // @param -> address of user to transfer and amount (Retire Ethers in Account)
    function retireMyEther(address payable to, uint256 amount)
    public {
        User storage user = users[msg.sender];
        if(block.timestamp > block.timestamp + time) 
        user.valueDeposited = user.valueDeposited + 
        (((user.valueDeposited * 1 ether / pool) * pool) / 1 ether);
        require(amount <= user.valueDeposited);
        to.transfer(amount);
        user.valueDeposited -= amount;
        emit Sent(msg.sender, amount);
    }

    function poolValue() public view returns(uint256) {
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