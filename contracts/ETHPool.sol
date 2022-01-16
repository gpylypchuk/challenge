// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
* @title ETHPool
*/

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ETHPool is AccessControl {

    event Received(address indexed addr, uint256 amount);
    event Sent(address indexed addr, uint256 amount);
    event Deposited(bool success);

    bytes32 private constant TEAM_MEMBER = keccak256("TEAM_MEMBER");
    uint256 private pool;
    uint256 private reward;
    uint256 private depositDate;

    mapping(address => uint256) private balances;
    mapping(address => uint256) private sentDate;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEAM_MEMBER, msg.sender);
    }

    receive() external payable {
        require(msg.value > 0);
        balances[msg.sender] += msg.value;
        sentDate[msg.sender] = block.timestamp;
        emit Received(msg.sender, msg.value);
    }

    function depositRewards(uint256 _reward) onlyRole(TEAM_MEMBER) public {
        reward = _reward;
        pool = address(this).balance - _reward;
        depositDate = block.timestamp;
        emit Deposited(true);
    }

    function withdraw(address payable to, uint256 amount) public {
        if(sentDate[msg.sender] < depositDate && reward > 0)
        balances[msg.sender] = balances[msg.sender] + 
        (((balances[msg.sender] * 1 ether / pool) * reward) / 1 ether);
        require(amount <= balances[msg.sender]);
        to.transfer(amount);
        balances[msg.sender] -= amount;
        emit Sent(msg.sender, amount);
    }

    function poolValue() public view returns(uint256) {
        return address(this).balance;
    }

    function addTeamMember(address account) public onlyRole(TEAM_MEMBER) {
        grantRole(TEAM_MEMBER, account);
    }

    function removeTeamMember(address account) public onlyRole(TEAM_MEMBER) {
        revokeRole(TEAM_MEMBER, account);
    }

}