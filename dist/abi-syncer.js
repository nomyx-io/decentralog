"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var AbiSyncer = /** @class */ (function () {
    function AbiSyncer(web3, provider, gun, name, abi, address, debug, onSync) {
        this.debug = false;
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
    AbiSyncer.prototype.log = function () {
        var s = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            s[_i] = arguments[_i];
        }
        this.debug && console.log("AbiSyncer:".concat(s));
    };
    AbiSyncer.prototype.syncHistorical = function () {
        return __awaiter(this, void 0, void 0, function () {
            var events, _i, events_1, event_1, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log('syncHistorical');
                        events = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // get past events
                        if (!this.provider)
                            return [2 /*return*/];
                        this.contract && this.contract.setProvider(this.provider);
                        return [4 /*yield*/, this.contract.getPastEvents("allEvents", {
                                fromBlock: 0,
                                toBlock: "latest"
                            })];
                    case 2:
                        events = _a.sent();
                        for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
                            event_1 = events_1[_i];
                            event_1.address = this.address;
                            event_1.name = event_1.event;
                            event_1.event = event_1.raw.topics[0];
                            event_1.transactionHash = event_1.transactionHash;
                            event_1.blockNumber = event_1.blockNumber;
                            event_1.signature = event_1.signature;
                            this.addRecord(event_1, false);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error('error getting historical data', e_1.message);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, this];
                }
            });
        });
    };
    AbiSyncer.prototype.syncLive = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.log('syncLive');
                try {
                    // listen for new events
                    this.contract && this.contract.events.allEvents({
                        fromBlock: "latest"
                    }, function (error, event) {
                        if (error) {
                            console.error("Error listening for events for contract: ".concat(_this.name), error);
                            return;
                        }
                        if (!event.event)
                            event.event = event.raw.topics[0];
                        _this.addRecord(event, true);
                    });
                }
                catch (e) {
                    console.error("Error fetching events for contract: ".concat(this.name), e);
                }
                return [2 /*return*/, this];
            });
        });
    };
    AbiSyncer.prototype.addRecord = function (event, isLive) {
        this.log('addRecord', JSON.stringify(event), isLive);
        var convertBigIntToString = function (obj) {
            for (var key in obj) {
                if (typeof obj[key] === 'bigint') {
                    obj[key] = obj[key].toString();
                }
            }
        };
        var returnValues = Object.entries(event.returnValues || {}).reduce(function (acc, _a) {
            var key = _a[0], value = _a[1];
            if (value)
                acc[key] = value;
            return acc;
        }, {});
        convertBigIntToString(returnValues);
        var topicsOut = event.raw.topics.slice(1).reduce(function (acc, topic, index) {
            acc["topic".concat(index + 1)] = topic;
            return acc;
        }, {});
        convertBigIntToString(topicsOut);
        var dbObject = __assign(__assign({ address: event.address + '', name: event.name || "", event: event.event + '', transactionHash: event.transactionHash + '', blockNumber: event.blockNumber + '', topic: event.event }, topicsOut), returnValues);
        this.gun.get('events').set(dbObject);
        this.gun.get('events').get(dbObject.transactionHash).put(dbObject);
        this.gun.get('events').get(dbObject.address).get(dbObject.topic).put(dbObject);
        this.onSync(dbObject, isLive);
    };
    AbiSyncer.prototype.sync = function () {
        this.log('sync');
        this.syncHistorical().then(this.syncLive);
        return this;
    };
    AbiSyncer.prototype.subscribe = function (topic, callback) {
        this.log('subscribe', topic);
        return this.get(topic).map().on(callback);
    };
    AbiSyncer.prototype.get = function (name) {
        this.log('get', name);
        return this.gun.get(name);
    };
    return AbiSyncer;
}());
exports.default = AbiSyncer;
//# sourceMappingURL=abi-syncer.js.map