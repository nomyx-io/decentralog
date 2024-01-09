"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gun_1 = require("gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");
class GunJSBDIndexer {
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
module.exports = {
    default: GunJSBDIndexer
}