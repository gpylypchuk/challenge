import React, { useEffect } from 'react';
import Web3 from 'web3';
import ethPoolContractBuild from './abi/ETHPool.json';

function App() {
	
	const ethPoolAddress = '0x5006dEB7Ad141aEecAf9517E9e81A6B5Fb5876C6';	
	let selectedAccount, ethPoolContract, amountRetire, amountDeposit, web3;

	useEffect(() => {
    	let provider = window.ethereum;
		if(typeof provider !== 'undefined'){
            provider.request({ 
                method: 'eth_requestAccounts' 
            }).then((accounts) => {
                selectedAccount = accounts[0];
                console.log(`Selected Account is ${selectedAccount}`);
            });
            window.ethereum.on(
                'accountsChanged',
                (accounts) => {
                    selectedAccount = accounts[0];
                    console.log(`Selected Account changed to ${selectedAccount}`);
                });
        }
		web3 = new Web3(provider);
		ethPoolContract = new web3.eth.Contract(ethPoolContractBuild.abi, ethPoolAddress);
	}, []);

	const retire = () => {
		amountRetire = document.getElementById('retireValue').value;
		ethPoolContract.methods.retireMyEther(selectedAccount, amountRetire).send({from: selectedAccount});
	}

	const send = () => {
		amountDeposit = document.getElementById('depositValue').value;
		web3.eth.sendTransaction({
			from: selectedAccount,
			to: ethPoolAddress,
			value: amountDeposit
		});
	}

	return (
		<div className="App">
			<h1>Ethereum Pool</h1>
			<h4>Retire Ether</h4>
			<input type="number" placeholder="Amount to retire" id='retireValue' />
			<button onClick={retire}>Retire</button>
			<h4>Deposit Ether</h4>
			<input type="number" placeholder="Amount to deposit" id='depositValue' />
			<button onClick={send}>Deposit</button>
		</div>
	);
}

export default App;