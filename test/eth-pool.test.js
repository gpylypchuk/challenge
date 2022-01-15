const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { time } = require('@openzeppelin/test-helpers');

/** 
 * Tested with Hardhat
 * @run npx hardhat test
 * 
 * @dev To run the test use: set
 * mapping 'balances' to PUBLIC, 
 * uint 'endDate' to PUBLIC,
 * uint 'pool' to PUBLIC,
 * bytes32 hash 'TEAM_MEMBER' to PUBLIC.
 * 
 * This is because PRIVATE variables consume
 * less Gas in deployment.
 */

describe('Ethereum Pool Contract', () => {

  beforeEach(async() => {
    [owner, user, user2, user3, teamMember] = await ethers.getSigners();
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
    expect(await pool.poolValue()).to.be.equal(amount*4);
    expect(await pool.balances(user.address)).to.be.equal(amount*2);
  });

  /* 
    * In this test WE deposit User and Owner in the pool
    * We then retire the deposits from the user
    * We then check that the pool value is equal to the 
    * amount of the deposits menus the retire.
  */
  it("Should Retire Deposits from Users", async() => {
    const amount = 1000;
    await user.sendTransaction({ to: pool.address, value: amount });
    await pool.connect(user).retireMyEther(user.address, amount);
  });

  /*
    * Adds Team Member and with hasRole function from
    * OpenZeppelin contract https://docs.openzeppelin.com/contracts/3.x/api/access
    * We then check that the team member is added to the pool
  */
  it("Should Add Team Member", async() => {
    await pool.connect(owner).addTeamMember(teamMember.address);
    const isTeamMember = await pool.hasRole(pool.TEAM_MEMBER(), teamMember.address);
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

  it("Should return the block.timestamp when end deposited rewards", async() => {
    const amount = 1000;
    await user.sendTransaction({ to: pool.address, value: amount });
    await user2.sendTransaction({ to: pool.address, value: amount });
    await pool.connect(owner).depositRewards(amount);
    const endDate = await pool.endDate();
    console.log(`    🕐 Block: ${endDate}`);
  });

  it("Should deposit rewards", async() => {
    const amount = 2000;
    await user.sendTransaction({ to: pool.address, value: amount });
    await user2.sendTransaction({ to: pool.address, value: amount });
    await user3.sendTransaction({ to: pool.address, value: amount });
    await owner.sendTransaction({ to: pool.address, value: amount }); // "Rewards"
    const currentTimeBefore = await time.latest();
    console.log(`    🕐 Current Time Before Increase: ${currentTimeBefore}`);
    await pool.connect(owner).depositRewards(amount); // 
    await user3.sendTransaction({ to: pool.address, value: amount });
    await time.increase(time.duration.years(7));
    await time.advanceBlock();
    const currentTimeAfter = await time.latest();
    console.log(`    🕐 Current Time After Increase: ${currentTimeAfter}`);
    await user2.sendTransaction({ to: pool.address, value: amount });
    const poolValue = await pool.pool();
    expect(poolValue).to.be.equal(amount*3);
    await pool.connect(user).retireMyEther(user3.address, amount+5);
  })

});