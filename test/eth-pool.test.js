const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

/** 
 * Tested with Hardhat
 * @run npx hardhat test
 * 
 * ETHPool Contract (contracts folder).
 * @test array 'accounts' from PRIVATE to PUBLIC
 * @test mapping 'users' from PRIVATE to PUBLICSS
 */

describe('Ethereum Pool Contract', () => {

  beforeEach(async() => {
    [owner, user, teamMember] = await ethers.getSigners();
    Pool = await ethers.getContractFactory("ETHPool");
    pool = await Pool.deploy();
    await pool.deployed();
  });

  it("Depositing in Pool!", async() => {
    const amount = 1000;
    await owner.sendTransaction({ to: pool.address, value: amount });
    await owner.sendTransaction({ to: pool.address, value: amount });
    await user.sendTransaction({ to: pool.address, value: amount });
    await user.sendTransaction({ to: pool.address, value: amount });
    expect(await pool.getPoolValue()).to.be.equal(amount*4);
  });

  it("Should Retire Deposits from Users", async() => {
    /* 
      * In this test WE deposit User and Owner in the pool
      * We then retire the deposits from the user
      * We then check that the pool value is equal to the 
      * amount of the deposits menus the retire.
    */
    const amount = 1000;
    await owner.sendTransaction({ to: pool.address, value: amount });
    await user.sendTransaction({ to: pool.address, value: amount });
    await pool.connect(user).retireMyEther(user.address, amount);
    const poolValue = await pool.getPoolValue();
    expect(poolValue).to.be.equal(amount);
  });

  // This test is From PRIVATE to PUBLIC accounts array.
  it("Should Return the indexed Address", async() => {
    const amount = 1000;
    await owner.sendTransaction({ to: pool.address, value: amount });
    await user.sendTransaction({ to: pool.address, value: amount });
    const userAddress = await pool.accounts(1);
    expect(userAddress).to.be.equal(user.address);
  });

  it("Should Add Team Member", async() => {
    /*
      * I test this contract by adding a team member
      * and the team member is in charge of depositing
      * rewards of all users. So the amount of all POOL 
      * Value should equals to the amount of ether first
      * deposited plus the amount of ether earned.
    */
    const amount = 1000;
    const earned = 1000;
    await owner.sendTransaction({ to: pool.address, value: amount });
    await user.sendTransaction({ to: pool.address, value: amount });
    const userAddress = await pool.accounts(1);
    console.log(`    😋 User Address: ${userAddress}`);
    await pool.connect(owner).addTeamMember(teamMember.address);
    await pool.connect(teamMember).depositRewards(earned);
    const newPoolValue = await pool.poolValue();
    expect(newPoolValue).to.equal(earned+amount*2);
  });

  it("Should Remove Team Member", async() => {
    /*
      * Similar to the previous test, but we we
      * expect a revert.
      * First we expect a TRUE because is a TEAM MEMBER
      * Then we expect a REVERT because he was removed as
      * a TEAM MEMBER.
    */
    const amount = 1000;
    const earned = 1000;
    await owner.sendTransaction({ to: pool.address, value: amount });
    await user.sendTransaction({ to: pool.address, value: amount });
    await pool.connect(owner).addTeamMember(teamMember.address);
    expect(
      await pool.connect(owner)
      .hasRole(pool.TEAM_MEMBER(),
      teamMember.address
      )).to.equal(true);
    await pool.connect(owner).removeTeamMember(teamMember.address);
    expect(pool.connect(teamMember).depositRewards(earned)).to.be.reverted;
  });

  // When user Deposits the Struct show us if is Staking by depositing.
  it("Should Deposit, Stake, and then Stake equals FALSE", async() => {
    const amount = 1000;
    await user.sendTransaction({ to: pool.address, value: amount });
    const usersTrue = await pool.users(user.address);
    expect(usersTrue.staking).to.equal(true);
    await pool.connect(user).retireMyEther(user.address, amount);
    const usersFalse = await pool.users(user.address);
    expect(usersFalse.staking).to.equal(false);
  });

  it("Should return the block.timestamp when user deposited", async() => {
    const amount = 1000;
    await user.sendTransaction({ to: pool.address, value: amount });
    const block = await pool.users(user.address);
    console.log(`    🕐 Block: ${block.startDate}`);
  });

  it("Should return all user Data", async() => {
    const amount = 1000;
    await user.sendTransaction({ to: pool.address, value: amount });
    const struct = await pool.users(user.address);
    console.log(`    💰 Value Deposited: ${struct.valueDeposited}`);
    console.log(`    🕐 Time Started: ${struct.startDate}`);
    console.log(`    🤔 Is Staking?: ${struct.staking}`);
    console.log(`    😎 Is New User?: ${struct.newUser}`);
  });

});