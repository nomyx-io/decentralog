# decentralog

## Introduction

This project provides a framework for synchronizing and indexing blockchain data, particularly focusing on Ethereum smart contracts events. It is designed to facilitate developers in building Web3 applications by providing a streamlined way to process and index events coming from the Ethereum blockchain.

## Components

### `AbiSyncer`

The `AbiSyncer` class interfaces with Ethereum smart contracts, using provided ABI and contract addresses to sync event data. It efficiently retrieves past events and sets up listeners for ongoing contract activities.

Constructor Properties:

- `abi` (Array): The ABI array of the smart contract. This is essential for the `AbiSyncer` to understand the contract's structure and events.
- `address` (String): The Ethereum address of the smart contract. `AbiSyncer` uses this to pinpoint the exact contract to sync from.
- `provider` (Web3 Provider): The Web3 provider instance through which interactions with the Ethereum network will be made.
- `startBlock` (Number, optional): The block number from which to start syncing events. If not set, it starts from the latest block.

Example:

```javascript
const abiSyncer = new AbiSyncer({
  abi: contractAbi,
  address: '0xContractAddress',
  provider: web3Provider,
  startBlock: 1234567
});
```

### `DecentralizedIndexer`

The `DecentralizedIndexer` is a React component enhancing the `AbiSyncer`. It provides real-time visualization of smart contract synchronization, as well as decentralized event indexing. This component operates on GunDB, a decentralized database, creating a user-friendly interface for indexing blockchain events.

Properties:

- `contracts` (Object): An object where keys are contract names and values are objects containing contract details that include `abi` and `address`.
- `provider` (Web3 Provider): The Web3 provider instance to interact with the Ethereum network.

Example:

```jsx
<DecentralizedIndexer
  contracts={{
    MyContract: {
      abi: contractAbi,
      address: '0xContractAddress'
    }
  }}
  provider={web3Provider}
/>
```

### `Web3Button`

The `Web3Button` component allows users to interact with Web3 functionalities through a button interface, enabling seamless integration with smart contracts and transactions.

Properties:

- `provider` (Web3 Provider): A Web3 provider instance for interacting with the Ethereum network.
- `contract` (Object): An object containing the `abi`, `address`, and any contract method details necessary for transaction.
- `method` (String): The contract method to call upon button click.
- `args` (Array, optional): Arguments to pass to the contract method call.
- `onSuccess` (Function, optional): A callback function that is called when the transaction is successful.
- `onError` (Function, optional): A callback function that is called when the transaction encounters an error.

Example:

```jsx
<Web3Button
  provider={web3Provider}
  contract={{
    abi: contractAbi,
    address: '0xContractAddress',
    method: 'transfer',
    args: [recipientAddress, amount]
  }}
  onSuccess={(receipt) => console.log('Transaction success:', receipt)}
  onError={(error) => console.error('Transaction error:', error)}
/>
```

## Installation

To get started with this project, clone the repository and install the required dependencies using `npm install`.

## Usage

To utilize this framework, instantiate `AbiSyncer` with the necessary contract details and employ `DecentralizedIndexer` to render the events on a web interface. Here's a simple example:

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { AbiSyncer, DecentralizedIndexer } from './dist/index;

// Smart contract details and provider
const contractDetails = {
  abi: [...], // Contract ABI
  address: '0xContractAddress', // Contract Address
};

const App = () => (
  <DecentralizedIndexer contracts={{ MyContract: contractDetails }} provider={web3Provider} />
);

ReactDOM.render(<App />, document.getElementById('root'));
```

## Contributing

Contributions are welcome! Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to the project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
