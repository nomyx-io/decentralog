"use strict";
var GUN = require("gun");
var Web3 = require("web3").Web3;
require("gun/sea");
require("gun/lib/webrtc");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");
// test code
var web3 = new Web3(new Web3.providers.WebsocketProvider("wss://eth-mainnet.g.alchemy.com/v2/dfyuC22bNEh-nL3Gc0DHaTLhFRPBR4JT"));
var gun = new GUN({
    peers: ["https://gunjs.herokuapp.com/gun"]
});
var contracts = {
    "0x6b175474e89094c44da98b954eedeac495271d0f": {
        name: "DAI",
        abi: [
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: "address",
                        name: "src",
                        type: "address"
                    },
                    {
                        indexed: true,
                        internalType: "address",
                        name: "dst",
                        type: "address"
                    },
                    {
                        indexed: false,
                        internalType: "uint256",
                        name: "wad",
                        type: "uint256"
                    }
                ],
                name: "Approval",
                type: "event"
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: "address",
                        name: "src",
                        type: "address"
                    },
                    {
                        indexed: true,
                        internalType: "address",
                        name: "guy",
                        type: "address"
                    },
                    {
                        indexed: false,
                        internalType: "uint256",
                        name: "wad",
                        type: "uint256"
                    }
                ],
                name: "ApprovalForAll",
                type: "event"
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: "address",
                        name: "holder",
                        type: "address"
                    },
                    {
                        indexed: false,
                        internalType: "address",
                        name: "spender",
                        type: "address"
                    },
                    {
                        indexed: false,
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256"
                    },
                    {
                        indexed: false,
                        internalType: "uint256",
                        name: "expiry",
                        type: "uint256"
                    },
                    {
                        indexed: false,
                        internalType: "bool",
                        name: "allowed",
                        type: "bool"
                    }
                ],
                name: "AuthorizationUsed",
                type: "event"
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: "address",
                        name: "holder",
                        type: "address"
                    },
                    {
                        indexed: false,
                        internalType: "address",
                        name: "spender",
                        type: "address"
                    },
                    {
                        indexed: false,
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256"
                    },
                    {
                        indexed: false,
                        internalType: "uint256",
                        name: "expiry",
                        type: "uint256"
                    }
                ],
                name: "AuthorizationCanceled",
                type: "event"
            }
        ],
        address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        debug: true,
        sync: true
    }
};
var service = new DecentralizedIndexingService(web3, gun, contracts, function (records, live) {
    console.log("records", records, live);
}, true);
service.sync();
//# sourceMappingURL=test.js.map