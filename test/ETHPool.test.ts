import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ETHPool__factory, ETHPool } from "../typechain-types";

const TEAM_MEMBER_BYTES32 =
  "0x6a74bd5720a9ba372841f356cf6872b1006d19dfc367da64ab98cf47824ed3c0";

describe("Ethereum Pool contract", function () {
  let pool: ETHPool;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ETHPoolFactory = (await ethers.getContractFactory(
      "ETHPool",
      owner
    )) as ETHPool__factory;
    pool = await ETHPoolFactory.deploy();
  });

  describe("Access Control Functions", function () {
    it("Owner Should be the TEAM_MEMBER", async function () {
      expect(await pool.hasRole(TEAM_MEMBER_BYTES32, owner.address)).to.equal(
        true
      );
    });

    it("Should add and revoke TEAM_MEMBER", async function () {
      expect(await pool.hasRole(TEAM_MEMBER_BYTES32, user1.address)).to.equal(
        false
      );

      await pool.connect(owner).grantRole(TEAM_MEMBER_BYTES32, user1.address);

      expect(await pool.hasRole(TEAM_MEMBER_BYTES32, user1.address)).to.equal(
        true
      );

      await pool.connect(owner).revokeRole(TEAM_MEMBER_BYTES32, user1.address);

      expect(await pool.hasRole(TEAM_MEMBER_BYTES32, user1.address)).to.equal(
        false
      );
    });

    it("Should Renounce Role", async function () {
      await pool
        .connect(owner)
        .renounceRole(TEAM_MEMBER_BYTES32, owner.address);
      expect(await pool.hasRole(TEAM_MEMBER_BYTES32, owner.address)).to.equal(
        false
      );
    });

    it("Should NOT Renounce Role", async function () {
      await pool.connect(owner).grantRole(TEAM_MEMBER_BYTES32, user1.address);
      await pool
        .connect(owner)
        .renounceRole(TEAM_MEMBER_BYTES32, owner.address);
      expect(await pool.hasRole(TEAM_MEMBER_BYTES32, owner.address)).to.equal(
        false
      );
    });
  });

  describe("Deposit and Withdraw", function () {
    it("Should deposit Ether into pool", async function () {
      const amount = ethers.utils.parseEther("1");
      //Deposits 2 Ethers
      await pool.connect(user1).deposit({ value: amount });
      await pool.connect(user1).deposit({ value: amount });

      expect(await pool.balance(user1.address)).to.equal(
        ethers.utils.parseEther("2")
      );
    });

    it("Should withdraw Ether from the pool", async function () {
      const amount = ethers.utils.parseEther("1");
      await pool.connect(user1).deposit({ value: amount });
      await pool.connect(user1).deposit({ value: amount });
      await pool.connect(user1).deposit({ value: amount });
      await pool.connect(user1).withdraw();
      expect(await pool.connect(owner).balance(user1.address)).to.equal(0);
    });

    it("Should revert by sending Ether with transaction", async function () {
      const amount = ethers.utils.parseEther("1");
      await expect(
        user1.sendTransaction({ to: pool.address, value: amount })
      ).to.be.revertedWith("No Receive: Only with Deposit function");
    });

    it("Should revert by sending 0 Ether", async function () {
      const amount = ethers.utils.parseEther("0");
      await expect(
        pool.connect(user1).deposit({ value: amount })
      ).to.be.revertedWith("Deposit: send more than 0 ether");
    });

    it("Should revert by withdrawing 0 Ether", async function () {
      const amount = ethers.utils.parseEther("1");
      await pool.connect(user1).deposit({ value: amount });
      await pool.connect(user1).withdraw();
      await expect(pool.connect(user1).withdraw()).to.be.revertedWith(
        "Withdraw: Nothing to withdraw"
      );
    });

    it("Should Able to withdraw with his rewards", async function () {
      const amount = ethers.utils.parseEther("100");
      const reward = ethers.utils.parseEther("100");

      await pool.connect(user1).deposit({ value: amount });
      await pool.connect(user2).deposit({ value: amount });

      await pool.connect(owner).depositRewards({ value: reward });

      //Expects that the event emitted has the arg of 150 Ether withdrew (amount + reward)
      await expect(await pool.connect(user1).withdraw())
        .to.emit(pool, "Withdrew")
        .withArgs(true, "0x", ethers.utils.parseEther("150"));

      expect(await pool.connect(owner).balance(user1.address)).to.equal(0);
    });
  });

  describe("Team Member function (Deposit Rewards)", function () {
    it("Should deposit rewards", async function () {
      const amount = ethers.utils.parseEther("1");
      const tx = await pool.connect(owner).depositRewards({ value: amount });
      expect(tx.value.toString()).to.equal(amount);
    });

    it("Users Should NOT be able to access Deposit Rewards Function", async function () {
      await expect(
        pool.connect(user1).depositRewards({ value: 1 })
      ).to.be.revertedWith(
        "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x6a74bd5720a9ba372841f356cf6872b1006d19dfc367da64ab98cf47824ed3c0"
      );
    });
  });
});
