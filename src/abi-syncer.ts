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
        onSync: any
    ) {
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
        this.addRecords = this.addRecords.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.get = this.get.bind(this);
    }
    log(...s: any) {
        this.debug && console.log(`AbiSyncer:${s}`);
    }
    syncHistorical() {
        this.log("syncHistorical");
        let events: any = [];
        if (!this.provider) return;
        this.contract && this.contract.setProvider(this.provider);
        return this.contract
            .getPastEvents("allEvents", {
                fromBlock: 0,
                toBlock: "latest"
            })
            .then((_events: any) => {
                for (const event of _events) {
                    event.address = this.address;
                    event.name = event.event;
                    event.event = event.raw.topics[0];
                    event.transactionHash = event.transactionHash;
                    event.blockNumber = event.blockNumber;
                    event.signature = event.signature;
                }
                const recs = this.addRecords(_events, false);
                events.push(...recs);
            })
            .then(() => {
                this.log("syncHistorical done");
            })
            .catch((err: any) => {
                console.error("error getting historical data", err.message);
            });
    }
    syncLive() {
        this.log("syncLive", this.address);
        // listen for new events
        return (
            this.contract &&
            this.contract.events
                .allEvents(
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
                        if (!event.event) event.event = event.raw.topics[0];
                        return this.addRecords([event], true);
                    }
                )
                .catch((err: any) =>
                    console.error(`Error fetching events for contract: ${this.name}`, err)
                )
        );
    }
    addRecords(events: any, isLive: boolean) {
        this.log("addRecords", events.length, isLive);
        const convertBigIntToString = (obj: any) => {
            const convertNested = (nestedObj: any) => {
                for (const key in nestedObj) {
                    if (typeof nestedObj[key] === "object" && nestedObj[key] !== null) {
                        convertNested(nestedObj[key]);
                    } else if (typeof nestedObj[key] === "bigint") {
                        nestedObj[key] = nestedObj[key].toString();
                    }
                }
            };
            if (typeof obj === "object" && obj !== null) {
                convertNested(obj);
            }
            return obj;
        };
        function arrayToObject(obj: any) {
            for (const key in obj) {
                if (Array.isArray(obj[key])) {
                    const arr = obj[key];
                    obj[key] = {};
                    for (let i = 0; i < arr.length; i++) {
                        obj[key][i] = arr[i];
                    }
                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                    arrayToObject(obj[key]);
                }
            }
            return obj;
        }
        const dbObjectsOut: any = [];
        events.forEach((event: any) => {
            const returnValues = Object.entries(event.returnValues || {}).reduce(
                (acc: any, [key, value]: any) => {
                    if (value) acc[key] = value;
                    return acc;
                },
                {}
            );
            const topicsOut = event.raw.topics
                .slice(1)
                .reduce((acc: any, topic: any, index: any) => {
                    acc[`topic${index + 1}`] = topic;
                    return acc;
                }, {});
            let dbObject = convertBigIntToString({
                address: event.address + "",
                name: event.name || "",
                event: event.event + "",
                transactionHash: event.transactionHash + "",
                blockNumber: event.blockNumber + "",
                topic: event.event,
                ...topicsOut,
                ...returnValues
            });
            dbObject = arrayToObject(dbObject);

            this.gun.get('events').set(dbObject);
            this.gun.get('events').get(dbObject.transactionHash).put(dbObject);
            this.gun.get('events').get(dbObject.address).get(dbObject.topic).put(dbObject);
            dbObjectsOut.push(dbObject);
        });
        this.onSync(dbObjectsOut, isLive);
        return dbObjectsOut;
    }
    sync() {
        this.log("sync");
        return this.syncHistorical().then(this.syncLive);
    }
    subscribe(topic: any, callback: any) {
        this.log("subscribe", topic);
        return this.get(topic).map().on(callback);
    }
    get(name: string) {
        this.log("get", name);
        return this.gun.get(name);
    }
}