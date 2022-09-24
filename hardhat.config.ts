import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";

dotenv.config();

// Total amount of ETH held in the contract
// @run npx hardhat held --contract 0x2C129bE4E59F56D8995bEFB38022a2F3c714d7b6

task("held", "Prints the total amount of ETH held in the contract")
  .addParam("contract", "The contract address")
  .setAction(async (taskArgs, { ethers }) => {
    const provider = new ethers.providers.InfuraProvider(
      "goerli",
      process.env.ID
    );
    const balance = await provider.getBalance(taskArgs.contract);
    console.log(ethers.utils.formatEther(balance), "ETH");
  });

// GOERLI TESTNET DEPLOY
// @run TESTNET: npx hardhat run --network goerli ./scripts/deploy-ethPool.ts
// @run VERIFY: npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    goerli: {
      url: process.env.GOERLI_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.API_KEY || "",
    },
  },
};

export default config;
