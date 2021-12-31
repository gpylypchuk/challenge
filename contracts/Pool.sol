// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Pool is AccessControl {

    event Received(address, uint);
    event Withdrawed(address, uint);
    event RewardsWithdrawed(string);

    uint public poolValue;
    bytes32 public constant TEAM_MEMBER_ROLE = keccak256("TEAM_MEMBER_ROLE");
    address [] public usersAddr;

    struct Data {
        uint userValueDeposited;
        uint userTimeStartedStaking;
        bool staking;
        bool newUser;
    }

    Data[] public data;

    mapping(address => Data) public users;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEAM_MEMBER_ROLE, msg.sender);
    }

    receive () external payable {
        require(msg.value > 0, "You have to deposit at least 1 wei.");
        if(!(users[msg.sender].newUser)) usersAddr.push(msg.sender);
        users[msg.sender].userValueDeposited += msg.value;
        users[msg.sender].userTimeStartedStaking = block.timestamp;
        users[msg.sender].staking = true;
        users[msg.sender].newUser = true;
        poolValue += msg.value;
    }

    function withdrawRewards(uint interest) onlyRole(TEAM_MEMBER_ROLE) public {

        for (uint i = 0; i < usersAddr.length; i++){
            address user = usersAddr[i];
            uint sevenDaysTime = 604800;
            if(block.timestamp >= users[user].userTimeStartedStaking + sevenDaysTime && users[user].staking) {
                uint rewards = users[user].userValueDeposited * interest / 100;
                users[user].userValueDeposited += rewards;
                poolValue += rewards;
            }                         
        }

    }

    function withdraw() public payable {
        (msg.sender).call{ value: users[msg.sender].userValueDeposited, gas: 100000 };
        poolValue -= users[msg.sender].userValueDeposited;
        if(users[msg.sender].staking) users[msg.sender].userValueDeposited = 0;
        emit Withdrawed(msg.sender, users[msg.sender].userValueDeposited);
    }

    function addTeamMember(address account) public {
        grantRole(TEAM_MEMBER_ROLE, account);
    }

    function removeTeamMember(address account) public {
        revokeRole(TEAM_MEMBER_ROLE, account);
    }

}