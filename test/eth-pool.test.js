const { expect } = require("chai");
const { ethers } = require("hardhat");

/** 
* Tested with Hardhat
* @run npx hardhat test
*/

const TEAM_MEMBER_BYTES32 = '0x6a74bd5720a9ba372841f356cf6872b1006d19dfc367da64ab98cf47824ed3c0';

describe("Testing Ethereum Pool with Rewards Contract", () => {

  beforeEach(async() => {
    [owner, user, anotherUser] = await ethers.getSigners();
    Pool = await ethers.getContractFactory("ETHPool");
    pool = await Pool.deploy();
    await pool.deployed();
  });

  it("Deployer Should be Team Member", async() => {
    expect(await pool.hasRole(TEAM_MEMBER_BYTES32, owner.address)).to.equal(true);
  });

  it("Should return the total pool value", async() => {
    await user.sendTransaction({to: pool.address, value: ethers.utils.parseEther("1")});
    await anotherUser.sendTransaction({to: pool.address, value: ethers.utils.parseEther("1")});
    await pool.connect(owner).depositRewards({value: ethers.utils.parseEther("0.5")});
    expect(await pool.poolValue()).to.equal(ethers.utils.parseEther("2.5"));
  });

  it("Should Receive Ether from users", async() => {
    await user.sendTransaction({to: pool.address, value: ethers.utils.parseEther("1")});
    expect(await pool.balances(user.address)).to.equal(ethers.utils.parseEther("1"));
    console.log(`User Block Timestamp: ${await pool.depositDate(user.address)}`);
  });

  it("User Should Not Deposit Rewards", async() => {
    expect(pool.connect(user).depositRewards({value: ethers.utils.parseEther("5")})).to.be
    .revertedWith(
      "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x6a74bd5720a9ba372841f356cf6872b1006d19dfc367da64ab98cf47824ed3c0"
      );
  });

  it("User Should Can not Claim Rewards Twice or More", async() => {
    await user.sendTransaction({to: pool.address, value: ethers.utils.parseEther("10")});
    await pool.connect(owner).depositRewards({value: ethers.utils.parseEther("5")});
    await pool.connect(user).claimRewards();
    expect(pool.connect(user).claimRewards()).to.be.revertedWith("Can not claim rewards before deposit");
  });

  it("User Should Can not claim rewards before Deposited Rewards", async() => {
    await user.sendTransaction({to: pool.address, value: ethers.utils.parseEther("10")});
    expect(pool.connect(user).claimRewards()).to.be.revertedWith("Can not claim rewards before deposit");
  });

  it("Should do correctly All Transactions", async() => {
    await user.sendTransaction({to: pool.address, value: ethers.utils.parseEther("10")});
    await anotherUser.sendTransaction({to: pool.address, value: ethers.utils.parseEther("15")});
    await pool.connect(owner).depositRewards({value: ethers.utils.parseEther("5")});
    await anotherUser.sendTransaction({to: pool.address, value: ethers.utils.parseEther("2")});
    console.log(`Rewards Date: ${await pool.rewardsDate()}`);
    console.log(`Rewards Value: ${await pool.rewards()}`);
    console.log(`Pool Value Moment: ${await pool.poolValueMoment()}`);
    await pool.connect(user).claimRewards();
    await pool.connect(user).withdraw(ethers.utils.parseEther("11.5"));
    // If user deposited after deposits of rewards again he will lose his rewards
    expect(pool.connect(anotherUser).claimRewards()).to.be.revertedWith("Can not claim rewards before deposit");
    expect(await pool.balances(anotherUser.address)).to.equal(ethers.utils.parseEther("17"));
  });

});