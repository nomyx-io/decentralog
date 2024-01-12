import AbiSyncer, { transformObject } from "./AbiSyncer";
export default class DecentralizedIndexingService {
    contracts: any;
    web3: any;
    gun: any;
    syncers: any;
    onSync: any;
    debug: boolean = false;
    constructor(web3: any, gun: any, contracts: any, onSync: any, debug: any) {
        this.contracts = contracts;
        this.web3 = web3;
        this.gun = gun;
        this.syncers = {};
        this.debug = debug;
        this.onSync = onSync;
        this.sync = this.sync.bind(this);
        this.syncHistorical = this.syncHistorical.bind(this);
        this.syncLive = this.syncLive.bind(this);
        this.addRecords = this.addRecords.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.get = this.get.bind(this);
    }

    log(...s: any) {
        this.debug && console.log(`DecentralizedIndexingService:${s}`);
    }

    sync() {
        this.log("sync");
        this.syncHistorical();
        this.syncLive();
    }

    syncHistorical() {
        this.log("syncHistorical");
        for (const contract of Object.values(this.contracts) as any) {
            const syncer = new AbiSyncer(
                this.web3,
                this.gun,
                contract.name,
                contract.abi,
                contract.address,
                this.debug,
                this.addRecords
            );
            this.syncers[contract.address] = syncer;
            syncer.syncHistorical();
        }
    }

    syncLive() {
        this.log("syncLive");
        for (const contract of Object.values(this.contracts) as any) {
            const syncer = this.syncers[contract.address];
            syncer.syncLive();
        }
    }

    addRecords(records: any, live: any) {
        this.log("addRecords", live);
        const recs: any = [];
        for (const record of records) {
            const rec = {
                ...record,
                live
            };
            recs.push(rec);
        }
        this.gun.get("records").put(transformObject(recs));
        this.onSync && this.onSync(recs, live);
        return recs;
    }

    subscribe() {
        this.log("subscribe");
        for (const contract of Object.values(this.contracts) as any) {
            const syncer = this.syncers[contract.address];
            syncer.subscribe();
        }
    }

    get() {
        this.log("get");
        return this.gun.get("records");
    }
}
