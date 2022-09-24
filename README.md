# Ethereum Pool 💸

> Actually deployed at **[Goerli](https://goerli.etherscan.io/address/0x2c129be4e59f56d8995befb38022a2f3c714d7b6)**

> Frontend _(with Nextjs, Typescript, Ethers and Ness.css)_ deployed at **[Vercel](https://challenge-interface-gpylypchuk.vercel.app/)**

## Features 🛠

| Feature                               | Supported |
| ------------------------------------- | --------- |
| Users can Deposit                     | ✔         |
| Users can Withdraw                    | ✔         |
| Team Members Can Deposit Rewards      | ✔         |
| Goerli Deployed and Verified Contract | ✔         |
| Tests                                 | ✔         |
| Frontend to Interact                  | ✔         |

## How to Deploy Your ETHPool Contract 📝

> Using Goerli Testing Network (You have balance in your Wallet)

1. Install the dependencies: `npm install --save-dev`
2. Create a `.env` and put your private key and InfuraNode ID following the `.env.example` example
3. Deploy the ETHPool Contract with `npx hardhat run --network goerli ./scripts/deploy-ethPool.ts`
4. The address of the deployed contract will be printed in the console, copy it.
5. Now go to [Goerli](https://goerli.etherscan.io/) and paste the address of the contract.
6. Verify the contract. To do this type in console: `npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS`
7. Done!, Now, you can test easily the contract in [Goerli Testnet](https://goerli.etherscan.io/)!
