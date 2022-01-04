const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

const content = fs.readFileSync('HelloWorld.sol', 'utf-8');

const input = {
  language: 'Solidity',
  sources: {
    'HelloWorld.sol' : {
      content,
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
}; 

const output = JSON.parse(solc.compile(JSON.stringify(input)));

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);

const { HelloWorld } = output.contracts["HelloWorld.sol"];
const { abi, evm } = HelloWorld;
 
const contract = new web3.eth.Contract(abi);

const deployAndRunContract = async () => {
  const addresses = await web3.eth.getAccounts();
  const gasPrice = await web3.eth.getGasPrice();

  contract.deploy({
    data: evm.bytecode.object,
  })
  .send({
    from: addresses[0],
    gas: 1000000,
    gasPrice,
  })
  .on('confirmation', async (confNumber, receipt) => {
    const { contractAddress } = receipt
    console.log("Deployed at", contractAddress);

    const contractInstance = new web3.eth.Contract(abi, contractAddress)

    const myName = await contractInstance.methods.getMyName().call();
    console.log("Result from blockchain:", myName);
  })
  .on('error', (err) => {
    console.log("Failed to deploy:", error) 
  })
}

deployAndRunContract();