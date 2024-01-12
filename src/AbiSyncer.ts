export const transformObject = (obj: any) => {
    const transformNested = (nestedObj: any) => {
        if (Array.isArray(nestedObj)) {
            // Convert array to object with indices as keys
            const newObj: any = {};
            for (let i = 0; i < nestedObj.length; i++) {
                newObj[i] = transformNested(nestedObj[i]);
            }
            return newObj;
        } else if (typeof nestedObj === "object" && nestedObj !== null) {
            // Traverse object properties
            for (const key in nestedObj) {
                nestedObj[key] = transformNested(nestedObj[key]);
            }
            return nestedObj;
        } else if (typeof nestedObj === "bigint") {
            // Convert BigInt to string
            return nestedObj.toString();
        }
        // Return other types unchanged
        return nestedObj;
    };
    // Begin transformation
    return transformNested(obj);
};
export const transformObjectToArray = (obj: any) => {
    // transform an objectified array back into an array
    const transformNested = (nestedObj: any) => {
        if (Array.isArray(nestedObj)) {
            // Convert array to object with indices as keys
            const newObj: any = [];
            for (let i = 0; i < nestedObj.length; i++) {
                newObj[i] = transformNested(nestedObj[i]);
            }
            return newObj;
        } else if (typeof nestedObj === "object" && nestedObj !== null) {
            // Traverse object properties
            for (const key in nestedObj) {
                nestedObj[key] = transformNested(nestedObj[key]);
            }
            return nestedObj;
        } else if (typeof nestedObj === "bigint") {
            // Convert BigInt to string
            return nestedObj.toString();
        }
        // Return other types unchanged
        return nestedObj;
    };

    // Begin transformation
    try {
        return transformNested(obj);
    }
    catch (e) {
        return obj;
    }
}

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
        gun: any,
        name: any,
        abi: any,
        address: any,
        debug: any,
        onSync: any
    ) {
        this.name = name;
        this.abi = abi;
        this.address = address;
        this.onSync = onSync;
        this.sync = this.sync.bind(this);
        this.web3 = web3;
        this.provider = web3.provider
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
        // get the block height of the current block
        return this.web3.eth.getBlock("latest")
            .then((block: any) => {
                let blockNumber = block.number;
                // convert to number from bigint
                blockNumber = Number(blockNumber);
                // get the events
                return this.contract
                    .getPastEvents("allEvents", {
                        fromBlock: blockNumber - 1000 < 0 ? 0 : blockNumber - 1000,
                        toBlock: "latest",
                        address: this.address,
                    })
                    .then((_events: any) => {
                        const tobjs: any = [];
                        for (const event of _events) {
                            event.address = this.address;
                            event.name = event.event;
                            event.event = event.raw.topics[0];
                            event.transactionHash = event.transactionHash;
                            event.blockNumber = event.blockNumber;
                            event.signature = event.signature;
                            tobjs.push(transformObject(event));
                        }
                        this.addRecords(tobjs, false);
                        events.concat(_events);
                    })
                    .then(() => {
                        this.log("syncHistorical done");
                        return events;
                    })
                    .catch((err: any) => {
                        console.error("error getting historical data", err.message);
                    });
            });
    }
    syncLive() {
        this.log("syncLive", this.address);
        // listen for new events
        return (
            this.contract &&
            this.contract.events
                .allEvents({ fromBlock: "latest" }, (error: any, event: any) => {
                    if (error) {
                        console.error(
                            `Error listening for events for contract: ${this.name}`,
                            error
                        );
                        return;
                    }
                    if (!event.event) event.event = event.raw.topics[0];
                    return this.addRecords([event], true);
                })
        );
    }
    addRecords(events: any, isLive: boolean) {
        if (!events || !events.forEach) return;
        this.log("addRecords", events.length, isLive);
        const dbObjectsOut: any = [];
        events.forEach((event: any) => {
            const returnValues = Object.entries(event.returnValues || {}).reduce(
                (acc: any, [key, value]: any) => {
                    if (value) acc[key] = value;
                    return acc;
                },
                {}
            );
            const topicsOut = event.raw.topics.slice && event.raw.topics
                .slice(1)
                .reduce((acc: any, topic: any, index: any) => {
                    acc[`topic${index + 1}`] = topic;
                    return acc;
                }, {});
            let dbObject = {
                address: event.address + "",
                name: event.name || "",
                event: event.event + "",
                transactionHash: event.transactionHash + "",
                blockNumber: event.blockNumber + "",
                topic: event.event,
                ...topicsOut || {},
                ...returnValues
            };
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
        if (!topic) return;
        this.log("subscribe", topic);
        return this.get(topic).map().on(callback);
    }
    get(name: string) {
        if (!name) return '';
        this.log("get", name);
        return this.gun.get(name);
    }
}