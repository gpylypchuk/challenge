const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { time } = require('@openzeppelin/test-helpers');

/** 
 * Tested with Hardhat
 * @run npx hardhat node -> To change time.
 * @run npx hardhat test
 * 
 * @test Change Contract 'ETHPool.sol'
 * state variables: 'TEAM_MEMBER' to PUBLIC,
 * 'pool' to PUBLIC, 'reward' to PUBLIC,
 * 'depositDate' to PUBLIC, 'sentDate' to PUBLIC
 */

describe('Ethereum Pool Contract', () => {

  beforeEach(async() => {
    [owner, user, otherUser, attacker, teamMember] = await ethers.getSigners();
    Pool = await ethers.getContractFactory("ETHPool");
    pool = await Pool.deploy();
    await pool.deployed();
  });

  describe('Deposits and Withdraws', () => {

    it('Should Deposits Ether', async() => {
      const amount = ethers.utils.parseEther('10');
      await user.sendTransaction({ to: pool.address, value: amount });
      expect(await pool.poolValue()).to.eq(amount);
    });

    it('Should Withdraws Ether', async() => {
      const amount = ethers.utils.parseEther('10');
      await user.sendTransaction({ to: pool.address, value: amount });
      await pool.connect(user).withdraw(user.address, amount);
      expect(await pool.poolValue()).to.eq(0);
    });

    it('Should not Withdraw Ether', async() => {
      const amount = ethers.utils.parseEther('10');
      await attacker.sendTransaction({ to: pool.address, value: amount });
      expect(
        pool.connect(attacker)
        .withdraw(attacker.address, amount+1)
      ).to.be.reverted;
    });

    it('Should let retire Ethers to another User', async() => {
      const amount = ethers.utils.parseEther('10');
      await user.sendTransaction({ to: pool.address, value: amount });
      await pool.connect(user).withdraw(owner.address, amount);
      expect(await pool.poolValue()).to.eq(0);
    });
    
  });

  describe('Adds and Remove Team Member', () => {

    it('Should add Team Member', async() => {
      await pool.connect(owner).addTeamMember(teamMember.address);
      expect(await pool.hasRole(pool.TEAM_MEMBER(), teamMember.address)).to.eq(true);
    });

    it('Should remove Team Member', async() => {
      await pool.connect(owner).addTeamMember(teamMember.address);
      expect(await pool.hasRole(pool.TEAM_MEMBER(), teamMember.address)).to.eq(true);
      await pool.connect(owner).removeTeamMember(teamMember.address);
      expect(await pool.hasRole(pool.TEAM_MEMBER(), teamMember.address)).to.eq(false);
    });

    it('Should not add Team Member', async() => {
      await expect(pool.connect(attacker).addTeamMember(attacker.address)).to.be.reverted;
    });

    it('Should not remove Team Member', async() => {
      await pool.connect(owner).addTeamMember(teamMember.address);
      expect(pool.connect(attacker).removeTeamMember(teamMember.address)).to.be.reverted;
      expect(await pool.hasRole(pool.TEAM_MEMBER(), teamMember.address)).to.eq(true);
    });

  });

  describe('Depositing Rewards', () => {

    it('Should Deposits rewards', async() => {
      const amount = ethers.utils.parseEther('10');
      const amountTriple = ethers.utils.parseEther('30');
      const retire = ethers.utils.parseEther('12.5');
      await user.sendTransaction({ to: pool.address, value: amount });
      await otherUser.sendTransaction({ to: pool.address, value: amountTriple });
      await owner.sendTransaction({ to: pool.address, value: amount }); // Rewards
      await pool.connect(owner).depositRewards(amount);
      expect(await pool.pool()).to.eq(ethers.utils.parseEther('40'));
      console.log(`      🕒 User Deposit Date: ${await pool.sentDate(user.address)}`);
      console.log(`      🕒 OtherUser Deposit Date: ${await pool.sentDate(otherUser.address)}`);
      console.log(`      ⌛ Deposit Date: ${await pool.depositDate()}`);
      console.log(`      🎁 Reward: ${await pool.reward()}`);
      await time.increase(time.duration.years(2));
      await time.advanceBlock();
      await pool.connect(user).withdraw(user.address, retire);
    });

    it('Should Deposit Rewards and can not withdraw more than balance', async() => {
      const amount = ethers.utils.parseEther('10');
      const amountTriple = ethers.utils.parseEther('30');
      const retire = ethers.utils.parseEther('12.51');
      await user.sendTransaction({ to: pool.address, value: amount });
      await otherUser.sendTransaction({ to: pool.address, value: amountTriple });
      await owner.sendTransaction({ to: pool.address, value: amount }); // Rewards
      await pool.connect(owner).depositRewards(amount);
      await time.increase(time.duration.years(2));
      await time.advanceBlock();
      expect(pool.connect(user).withdraw(user.address, retire)).to.be.reverted;
    });

    it('Should not deposit rewards', async() => {
      const amount = ethers.utils.parseEther('10');
      const amountTriple = ethers.utils.parseEther('30');
      const retire = ethers.utils.parseEther('11');
      await user.sendTransaction({ to: pool.address, value: amount });
      await otherUser.sendTransaction({ to: pool.address, value: amountTriple });
      expect(pool.connect(attacker).depositRewards(amount)).to.be.reverted;
      expect(pool.connect(user).withdraw(user.address, retire)).to.be.reverted;
    });

  });

});