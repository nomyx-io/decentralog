var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import AbiSyncer, { transformObject } from "./AbiSyncer";
var DecentralizedIndexingService = /** @class */ (function () {
    function DecentralizedIndexingService(web3, gun, contracts, onSync, debug) {
        this.debug = false;
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
    DecentralizedIndexingService.prototype.log = function () {
        var s = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            s[_i] = arguments[_i];
        }
        this.debug && console.log("DecentralizedIndexingService:".concat(s));
    };
    DecentralizedIndexingService.prototype.sync = function () {
        this.log("sync");
        this.syncHistorical();
        this.syncLive();
    };
    DecentralizedIndexingService.prototype.syncHistorical = function () {
        this.log("syncHistorical");
        for (var _i = 0, _a = Object.values(this.contracts); _i < _a.length; _i++) {
            var contract = _a[_i];
            var syncer = new AbiSyncer(this.web3, this.gun, contract.name, contract.abi, contract.address, this.debug, this.addRecords);
            this.syncers[contract.address] = syncer;
            syncer.syncHistorical();
        }
    };
    DecentralizedIndexingService.prototype.syncLive = function () {
        this.log("syncLive");
        for (var _i = 0, _a = Object.values(this.contracts); _i < _a.length; _i++) {
            var contract = _a[_i];
            var syncer = this.syncers[contract.address];
            syncer.syncLive();
        }
    };
    DecentralizedIndexingService.prototype.addRecords = function (records, live) {
        this.log("addRecords", live);
        var recs = [];
        for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
            var record = records_1[_i];
            var rec = __assign(__assign({}, record), { live: live });
            recs.push(rec);
        }
        this.gun.get("records").put(transformObject(recs));
        this.onSync && this.onSync(recs, live);
        return recs;
    };
    DecentralizedIndexingService.prototype.subscribe = function () {
        this.log("subscribe");
        for (var _i = 0, _a = Object.values(this.contracts); _i < _a.length; _i++) {
            var contract = _a[_i];
            var syncer = this.syncers[contract.address];
            syncer.subscribe();
        }
    };
    DecentralizedIndexingService.prototype.get = function () {
        this.log("get");
        return this.gun.get("records");
    };
    return DecentralizedIndexingService;
}());
export default DecentralizedIndexingService;
//# sourceMappingURL=DecentralizedIndexingService.js.map