# decentralog

## Introduction

This project provides a framework for synchronizing and indexing blockchain data, particularly focusing on Ethereum smart contracts events. It is designed to facilitate developers in building Web3 applications by providing a streamlined way to process and index events coming from the Ethereum blockchain.

## Components

### `AbiSyncer`

This component allows for connecting to an Ethereum smart contract using a provided ABI and address and syncing events data. It provides functionality to retrieve historical events and listen for new events from the contract.

### `GunJSBDIndexer`

`GunJSBDIndexer` is an indexing utility that uses GunDB, a decentralized database, to handle and index blockchain event data. It allows for subscribing to topics and adding event records with ease.

## Installation

To get started with this project, clone the repository and install the required dependencies using `npm install`.

## Usage

Create instances of `AbiSyncer` and `GunJSBDIndexer` to sync and index blockchain event data. Refer to the `src/index.ts` file for implementation details and code examples.

## Contributing

Contributions are welcome! Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to the project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
