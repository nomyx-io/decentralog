// localindexer.js
import Web3 from "web3";
import GUN from "gun";
import "gun/sea";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";

export class AbiSyncer {
  provider: any;
  name: string;
  abi: any;
  address: string;
  updater: any;
  web3: any;
  contract: any;
  constructor(
    provider: any,
    name: string,
    abi: any,
    address: string,
    updater: any
  ) {
    this.provider = provider;
    this.name = name;
    this.abi = abi;
    this.address = address;
    this.updater = new updater();
    updater.syncer = this;
    const options: any = {
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
    this.web3 = new Web3(options);
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
    } catch (e) {
      console.error('error getting historical data')
    }
    try {
      for (const event of events) {
        event.address = this.address;
        event.name = event.event;
        event.event = event.raw.topics[0];
        this.updater && this.updater.onAddRecord(this.name, event);
      }
      // listen for new events
      this.contract.events.allEvents(
        {
          fromBlock: "latest"
        },
        (error: any, event: any) => {
          if (error) {
            console.error(
              `Error listening for events for contract: ${this.name}`,
              error
            );
            return;
          }
          if (!event.event) {
            event.event = event.raw.topics[0];
          }
          this.updater && this.updater.onAddRecord(this.name, event);
        }
      );
    } catch (e) {
      console.error(`Error fetching events for contract: ${this.name}`, e);
    }
    return this;
  }

  subscribe(callback: any, topic: string) {
    return this.updater.subscribe(topic, callback);
  }
}

export class GunJSBDIndexer {
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
