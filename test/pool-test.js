const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Ethereum Pool Contract', () => {

  beforeEach(async function() {
    [owner, address1, address2] = await ethers.getSigners();
    Pool = await ethers.getContractFactory("Pool");
    pool = await Pool.deploy();
    await pool.deployed();
  });

  it("Depositing in Pool!", async function () {
    const value = 1000;
    await owner.sendTransaction({ to: pool.address, value: value });
    await address1.sendTransaction({ to: pool.address, value: value });
    await address2.sendTransaction({ to: pool.address, value: value });
    await address2.sendTransaction({ to: pool.address, value: value });
    await address2.sendTransaction({ to: pool.address, value: value });
    expect(await pool.poolValue()).to.be.equal(5000); // 5 * 1000
  });

  it("Withdraw their balances", async function () {
    await address2.sendTransaction({ to: pool.address, value: 1000 });
    await pool.connect(address2).withdraw();
    expect(await address2.getBalance()).to.be.equal(1000);
    expect(await pool.poolValue()).to.be.equal(0);
  });

  it("Should Withdraw Rewards from Pool", async function () {
    await address1.sendTransaction({ to: pool.address, value: 1000 });
    await address2.sendTransaction({ to: pool.address, value: 1000 });
    await pool.connect(owner).withdrawRewards(10);
    expect(await address2.getBalance()).to.be.equal(100);
  })

  it("Should add and remove team member", async function () {
    const txAdd = await (await pool.addTeamMember(address1.address)).wait();
    const txRemove = await (await pool.removeTeamMember(address1.address)).wait();
    expect(txAdd.events?.filter((x) => {return x.event == "RoleGranted"})).to.not.be.null;
    expect(txRemove.events?.filter((x) => {return x.event == "RoleRevoked"})).to.not.be.null;
  });

})