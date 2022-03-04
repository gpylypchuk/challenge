# Ethereum Pool 💸

> Actually deployed at [Rinkeby](https://rinkeby.etherscan.io/address/0xa5de4364e621f37f73dfa6fccd905aa427ae192a)

> Frontend deployed at [Vercel](https://challenge-interface-gpylypchuk.vercel.app/). It's simple, created with React and Chrakra.

## Features 🛠
| Feature | Supported |
|----------|------------ |
| Users can Deposit | ✔ |
| Users can Claim Rewards | ✔ |
| Users can Withdraw | ✔ |
| Security Review | ✔ |
| Team Members Can Deposit Rewards | ✔ |
| Rinkeby Deployed and Verified Contract | ✔ |
| Tests | ✔ |
| Frontend (still in process!) | ✔ |

## How to Deploy Your ETHPool Contract 📝

> Using Rinkeby Testing Network (You have balance in your Wallet)
1. Install the dependencies: `npm install --save-dev`
2. Create a `.env` and put your private key and InfuraNode ID following the `.env.example` example
4. Deploy the ETHPool Contract with `npx hardhat run --network rinkeby ./scripts/deploy-script.js`
5. The address of the deployed contract will be printed in the console, copy it.
6. Now go to [Rinkeby](https://rinkeby.etherscan.io/) and paste the address of the contract.
7. Verify the contract. To do this type in console: `npx hardhat flatten > Flattened.sol`
8. Delete extra Licenses in the contract, and then copy and paste in the verify section in Rinkeby Network.
9. Done!, Now, you can test easily the contract in Rinkeby Network!
