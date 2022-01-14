const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

/** 
 * Tested with Hardhat
 * @run npx hardhat test
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

  /* 
    * In this test WE deposit User and Owner in the pool
    * We then retire the deposits from the user
    * We then check that the pool value is equal to the 
    * amount of the deposits menus the retire.
  */
  it("Should Retire Deposits from Users", async() => {
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

  /*
    * Adds Team Member and with hasRole function from
    * OpenZeppelin contract https://docs.openzeppelin.com/contracts/3.x/api/access
    * We then check that the team member is added to the pool
  */
  it("Should Add Team Member", async() => {
    await pool.connect(owner).addTeamMember(teamMember.address);
    const isTeamMember = await pool.hasRole(pool.TEAM_MEMBER(), teamMember.address)
    expect(isTeamMember).to.be.equal(true);
  });

  /*
    * Similar to the previous test, but we we
    * expect a revert.
    * But for more performance in testing we
    * force the User to can not deposit rewards.
  */
  it("Should Remove Team Member", async() => {
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