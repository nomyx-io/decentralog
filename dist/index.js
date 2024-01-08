"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GunJSBDIndexer = exports.AbiSyncer = void 0;
// localindexer.js
const web3_1 = require("web3");
const gun_1 = require("gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");
class AbiSyncer {
    provider;
    name;
    abi;
    address;
    updater;
    web3;
    contract;
    constructor(provider, name, abi, address, updater) {
        this.provider = provider;
        this.name = name;
        this.abi = abi;
        this.address = address;
        this.updater = new updater();
        updater.syncer = this;
        const options = {
            timeout: 30000,
            clientConfig: {
                maxReceivedFrameSize: 100000000,
                maxReceivedMessageSize: 100000000,
                keepalive: true,
                keepaliveInterval: -1
            },
            reconnect: {
                auto: true,
                delay: 5000,
                maxAttempts: 10,
                onTimeout: false
            },
            provider: this.provider
        };
        this.sync = this.sync.bind(this);
        this.web3 = new web3_1.default(options);
        this.contract = new this.web3.eth.Contract(this.abi, this.address);
    }
    async sync() {
        let events = [];
        try {
            // get past events
            events = await this.contract.getPastEvents("allEvents", {
                fromBlock: 0,
                toBlock: "latest"
            });
        }
        catch (e) {
            console.error('error getting historical data');
        }
        try {
            for (const event of events) {
                event.address = this.address;
                event.name = event.event;
                event.event = event.raw.topics[0];
                this.updater && this.updater.onAddRecord(this.name, event);
            }
            // listen for new events
            this.contract.events.allEvents({
                fromBlock: "latest"
            }, (error, event) => {
                if (error) {
                    console.error(`Error listening for events for contract: ${this.name}`, error);
                    return;
                }
                if (!event.event) {
                    event.event = event.raw.topics[0];
                }
                this.updater && this.updater.onAddRecord(this.name, event);
            });
        }
        catch (e) {
            console.error(`Error fetching events for contract: ${this.name}`, e);
        }
        return this;
    }
    subscribe(callback, topic) {
        return this.updater.subscribe(topic, callback);
    }
}
exports.AbiSyncer = AbiSyncer;
class GunJSBDIndexer {
    gun;
    syncer;
    constructor() {
        this.gun = (0, gun_1.default)();
        this.onAddTopic = this.onAddTopic.bind(this);
        this.onAddRecord = this.onAddRecord.bind(this);
        this.subscribe = this.subscribe.bind(this);
    }
    subscribe(topic, callback) {
        const db = this.onAddTopic(topic);
        db.map().on(callback);
        return db;
    }
    get(name) {
        return this.gun.get(name);
    }
    onAddTopic(event) {
        return this.get(`${event}`);
    }
    onAddRecord(topic, event) {
        const db = this.onAddTopic(topic);
        // if returnValues is not an array, it is a single value
        if (!Array.isArray(event.returnValues)) {
            event.returnValues = event.returnValues._;
        }
        const returnValues = Object.keys(event.returnValues || {}).reduce((acc, key) => {
            acc[key] = event.returnValues[key];
            return acc;
        }, {});
        for (const key in Object.keys(returnValues)) {
            if (!returnValues[key]) {
                delete returnValues[key];
            }
        }
        const topicsOut = {};
        if (event.raw.topics.length > 1) {
            for (let i = 1; i < event.raw.topics.length; i++) {
                returnValues[`topic${i}`] = event.raw.topics[i];
                topicsOut[`topic${i}`] = event.raw.topics[i];
            }
        }
        const dbObject = {
            address: event.address + '',
            name: event.name || "",
            event: event.event + '',
            transactionHash: event.transactionHash + '',
            blockNumber: event.blockNumber + '',
            topic: event.event,
            ...topicsOut
        };
        db.put(dbObject);
        return db;
    }
    ;
}
exports.GunJSBDIndexer = GunJSBDIndexer;
module.exports = {
    AbiSyncer,
    GunJSBDIndexer
};
