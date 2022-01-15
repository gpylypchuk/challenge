// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
* @title ETHPool
* @dev Pool Staking contract for Ether
*/

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ETHPool is AccessControl {

    event Received(address indexed addr, uint256 amount);
    event Sent(address indexed addr, uint256 amount);
    event Deposited(bool success);

    bytes32 public constant TEAM_MEMBER = keccak256("TEAM_MEMBER");
    uint256 public pool;
    uint256 public reward;
    uint256 public endDate;

    mapping(address => uint256) public balances;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEAM_MEMBER, msg.sender);
    }

    receive() external payable {
        require(msg.value > 0);
        balances[msg.sender] += msg.value;
        emit Received(msg.sender, msg.value);
    }

    // Assuming this function will be executed every 7 days.
    function depositRewards(uint256 _reward) onlyRole(TEAM_MEMBER) public {
        reward += _reward;
        pool = address(this).balance - _reward;
        endDate = block.timestamp + 7 days;
        emit Deposited(true);
    }

    function retireMyEther(address payable to, uint256 amount)
    public {
        if(block.timestamp > endDate && reward > 0)
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