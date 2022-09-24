import { ethers } from "hardhat";

async function main() {
  const ETHPool = await ethers.getContractFactory("ETHPool");
  const ethPool = await ETHPool.deploy();

  await ethPool.deployed();

  console.log(`Ether Pool deployed to ${ethPool.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
