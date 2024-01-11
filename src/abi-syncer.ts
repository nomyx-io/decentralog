export default class AbiSyncer {
  provider: any;
  name: any;
  abi: any;
  address: any;
  onSync: any;
  web3: any;
  gun: any;
  contract: any;
  debug: boolean = false;
  constructor(
    web3: any, 
    provider: any, 
    gun: any, 
    name: any, 
    abi: any, 
    address: any, 
    debug: any, 
    onSync: any) {
      this.provider = provider;
      this.name = name;
      this.abi = abi;
      this.address = address;
      this.onSync = onSync;
      this.sync = this.sync.bind(this);
      this.web3 = web3;
      this.gun = gun;
      this.debug = debug;
      this.contract = new this.web3.eth.Contract(this.abi, this.address);
      this.syncHistorical = this.syncHistorical.bind(this);
      this.syncLive = this.syncLive.bind(this);
      this.addRecord = this.addRecord.bind(this);
      this.subscribe = this.subscribe.bind(this);
      this.get = this.get.bind(this);
  }
  log(...s: any) {
      this.debug && console.log(`AbiSyncer:${s}`)
  }
  async syncHistorical() {
      this.log('syncHistorical')
      let events: any = [];
      try {
          // get past events
          if(!this.provider) return;
          this.contract && this.contract.setProvider(this.provider);
          events = await this.contract.getPastEvents("allEvents", {
              fromBlock: 0,
              toBlock: "latest"
          });
          for (const event of events) {
              event.address = this.address;
              event.name = event.event;
              event.event = event.raw.topics[0];
              event.transactionHash = event.transactionHash;
              event.blockNumber = event.blockNumber;
              event.signature = event.signature;
              this.addRecord(event, false);
          }
      }
      catch (e: any) {
          console.error('error getting historical data', e.message);
      }
      return this;
  }
  async syncLive() {
      this.log('syncLive')
      try {
          // listen for new events
          this.contract && this.contract.events.allEvents({
              fromBlock: "latest"
          }, (error: any, event: { event: any; raw: { topics: any[]; }; }) => {
              if (error) {
                  console.error(`Error listening for events for contract: ${this.name}`, error);
                  return;
              }
              if (!event.event)
                  event.event = event.raw.topics[0];
              this.addRecord(event, true);
          });
      }
      catch (e) {
          console.error(`Error fetching events for contract: ${this.name}`, e);
      }
      return this;
  }
  addRecord(event: any, isLive: boolean) {
      this.log('addRecord', JSON.stringify(event), isLive)
      const convertBigIntToString = (obj: any) => {
          for (const key in obj) {
              if (typeof obj[key] === 'bigint') {
                  obj[key] = obj[key].toString();
              }
          }
      };

      const returnValues = Object.entries(event.returnValues || {}).reduce((acc: any, [key, value]: any) => {
          if (value) acc[key] = value;
          return acc;
      }, {});

      convertBigIntToString(returnValues);

      const topicsOut = event.raw.topics.slice(1).reduce((acc: any, topic: any, index: any) => {
          acc[`topic${index + 1}`] = topic;
          return acc;
      }, {});

      convertBigIntToString(topicsOut);

      const dbObject = {
          address: event.address + '',
          name: event.name || "",
          event: event.event + '',
          transactionHash: event.transactionHash + '',
          blockNumber: event.blockNumber + '',
          topic: event.event,
          ...topicsOut,
          ...returnValues
      };

      this.gun.get('events').set(dbObject);
      this.gun.get('events').get(dbObject.transactionHash).put(dbObject);
      this.gun.get('events').get(dbObject.address).get(dbObject.topic).put(dbObject);

      this.onSync(dbObject, isLive);
  }
  sync() {
      this.log('sync')
      this.syncHistorical().then(this.syncLive);
      return this;
  }
  subscribe(topic: any, callback: any) {
      this.log('subscribe', topic)
      return this.get(topic).map().on(callback);
  }
  get(name: string) {
      this.log('get', name)
      return this.gun.get(name);
  }
}