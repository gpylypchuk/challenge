require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

const projectId = process.env.INFURA_PROJECT_ID;
const privateKey = process.env.DEPLOYER_SIGNER_PRIVATE_KEY;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 * 
 * @deploy Create an .env file like the example
 * with your node project id from Infura (https://infura.io/),
 * then add the private key of the deployer to the .env file.
 * 
 * @run npx hardhat run --network rinkeby ./scripts/deploy-script.js
 * 
 * @deployed Contract already deployed at: 0xA5de4364e621f37F73Dfa6fCcd905aA427aE192a
 */
 module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${projectId}`,
      accounts: [privateKey]
    },
  },
};
