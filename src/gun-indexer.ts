import GUN from "gun";
import "gun/sea";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";

import IIndexer from "./indexer";

export default class GunJSBDIndexer implements IIndexer {
  gun: any;
  syncer: any;
  constructor() {
    this.gun = GUN();
    this.onAddTopic = this.onAddTopic.bind(this);
    this.onAddRecord = this.onAddRecord.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }
  subscribe(topic: string, callback: any) {
    const db = this.onAddTopic(topic);
    db.map().on(callback);
    return db;
  }
  get(name: any) {
    return this.gun.get(name);
  }
  onAddTopic(event: string) {
    return this.get(`${event}`);
  }
  onAddRecord(topic: any, event: any) {
    const db = this.onAddTopic(topic);
    // if returnValues is not an array, it is a single value
    if(!Array.isArray(event.returnValues)) {
      event.returnValues = event.returnValues._;
    }
    const returnValues = Object.keys(event.returnValues || {}).reduce((acc: any, key: string) => {
      acc[key] = event.returnValues[key];
      return acc;
    } , {});
    for(const key in Object.keys(returnValues)) {
      if(!returnValues[key]) {
        delete returnValues[key]
      }
    }
    const topicsOut: any = {};
    if(event.raw.topics.length > 1) {
      for(let i = 1; i < event.raw.topics.length; i++) {
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
  };
}
