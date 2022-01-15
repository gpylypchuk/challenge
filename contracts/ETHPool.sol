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

    bytes32 private constant TEAM_MEMBER = keccak256("TEAM_MEMBER");
    uint256 private constant time = 7 days;
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
    function depositRewards(uint256 earned)
    onlyRole(TEAM_MEMBER)
    public {
        uint256 pool = address(this).balance;
        for(uint256 i = 0; i < accounts.length; i++) {
            address addr = accounts[i];
            User storage user = users[addr];
            uint256 reward = earned * (user.valueDeposited * 1 ether) / pool / 1 ether;
            if(block.timestamp > user.startDate + time) user.valueDeposited += reward;
        }
        emit Deposited(true, earned);
    }

    // @param -> address of user to transfer and amount (Retire Ethers in Account)
    function retireMyEther(address payable to, uint256 amount)
    public {
        User storage user = users[msg.sender];
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