import React, { useEffect, useMemo } from 'react';
import Web3 from 'web3';
import ethPoolContractBuild from './abi/ETHPool.json';
import useTruncatedAddress from './hooks/useTruncatedAddress';
import './app.css';

function App() {
	
	const ethPoolAddress = '0x10f030EDfb5564D43e8f419fC41D7A19c05bC454';
	let selectedAccount, ethPoolContract, amountRetire, amountDeposit, web3, poolValue;
	let truncatedAddress = useTruncatedAddress(selectedAccount);

	useEffect(() => {
    	let provider = window.ethereum;
		if(typeof provider !== 'undefined'){
            provider.request({ 
                method: 'eth_requestAccounts' 
            }).then((accounts) => {
                selectedAccount = accounts[0];
				document.getElementById('account').innerHTML = selectedAccount;
                console.log(`Selected Account is ${selectedAccount}`);
            });
            window.ethereum.on(
                'accountsChanged',
                (accounts) => {
                    selectedAccount = accounts[0];
					document.getElementById('account').innerHTML = selectedAccount;
                    console.log(`Selected Account changed to ${selectedAccount}`);
                });
        }
		web3 = new Web3(provider);
		// ethPoolContract = new web3.eth.Contract(ethPoolContractBuild.abi, ethPoolAddress);
		// ethPoolContract.methods.getPoolValue().call().then(console.log);
	}, []);

	const retire = () => {
		amountRetire = document.getElementById('retireValue').value;
		amountDeposit = amountDeposit * 1000000000000000000;
		ethPoolContract.methods.retireMyEther(selectedAccount, amountRetire).send({from: selectedAccount});
	}

	const send = () => {
		amountDeposit = document.getElementById('depositValue').value;
		amountDeposit = amountDeposit * 1000000000000000000;
		web3.eth.sendTransaction({
			from: selectedAccount,
			to: ethPoolAddress,
			value: amountDeposit
		});
	}
	
	return (
		<div className="App">
			<h1 className='title'>Cube Finance</h1>
			<h1 className='subtitle'>Ethereum Pool</h1>
			<div className='account'>
				<p className='accountTitle'>Account</p>
				<p id='account'></p>
				<p id='pool'></p>
			</div>
			<div className='container'>
				<div className='row'>
					<div className='col-md-6'>
						<div className='card'>
							<div className='card-header'>
								<h3>Deposit</h3>
							</div>
							<div className='card-body'>
								<div className='form-group'>
									<label className='label'>Amount in Ether</label>
									<input type='number' className='form-control' id='depositValue'/>
								</div>
								<button className='btn btn-primary' onClick={send}>Deposit</button>
							</div>
						</div>
					</div>
					<div className='col-md-6'>
						<div className='card'>
							<div className='card-header'>
								<h3>Retire</h3>
							</div>
							<div className='card-body'>
								<div className='form-group'>
									<label className='label'>Amount in Ether</label>
									<input type='number' className='form-control' id='retireValue'/>
								</div>
								<button className='btn btn-primary' onClick={retire}>Retire</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;