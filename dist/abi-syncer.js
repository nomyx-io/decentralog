"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = require("web3");
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
exports.default = AbiSyncer;
