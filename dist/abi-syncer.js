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
        this.addRecords = this.addRecords.bind(this);
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
        var _this = this;
        this.log("syncHistorical");
        var events = [];
        if (!this.provider)
            return;
        this.contract && this.contract.setProvider(this.provider);
        return this.contract
            .getPastEvents("allEvents", {
            fromBlock: 0,
            toBlock: "latest"
        })
            .then(function (_events) {
            for (var _i = 0, _events_1 = _events; _i < _events_1.length; _i++) {
                var event_1 = _events_1[_i];
                event_1.address = _this.address;
                event_1.name = event_1.event;
                event_1.event = event_1.raw.topics[0];
                event_1.transactionHash = event_1.transactionHash;
                event_1.blockNumber = event_1.blockNumber;
                event_1.signature = event_1.signature;
            }
            var recs = _this.addRecords(_events, false);
            events.push.apply(events, recs);
        })
            .then(function () {
            _this.log("syncHistorical done");
        })
            .catch(function (err) {
            console.error("error getting historical data", err.message);
        });
    };
    AbiSyncer.prototype.syncLive = function () {
        var _this = this;
        this.log("syncLive", this.address);
        // listen for new events
        return (this.contract &&
            this.contract.events
                .allEvents({
                fromBlock: "latest"
            }, function (error, event) {
                if (error) {
                    console.error("Error listening for events for contract: ".concat(_this.name), error);
                    return;
                }
                if (!event.event)
                    event.event = event.raw.topics[0];
                return _this.addRecords([event], true);
            })
                .catch(function (err) {
                return console.error("Error fetching events for contract: ".concat(_this.name), err);
            }));
    };
    AbiSyncer.prototype.addRecords = function (events, isLive) {
        var _this = this;
        this.log("addRecords", events.length, isLive);
        var convertBigIntToString = function (obj) {
            var convertNested = function (nestedObj) {
                for (var key in nestedObj) {
                    if (typeof nestedObj[key] === "object" && nestedObj[key] !== null) {
                        convertNested(nestedObj[key]);
                    }
                    else if (typeof nestedObj[key] === "bigint") {
                        nestedObj[key] = nestedObj[key].toString();
                    }
                }
            };
            if (typeof obj === "object" && obj !== null) {
                convertNested(obj);
            }
            return obj;
        };
        function arrayToObject(obj) {
            for (var key in obj) {
                if (Array.isArray(obj[key])) {
                    var arr = obj[key];
                    obj[key] = {};
                    for (var i = 0; i < arr.length; i++) {
                        obj[key][i] = arr[i];
                    }
                }
                else if (typeof obj[key] === "object" && obj[key] !== null) {
                    arrayToObject(obj[key]);
                }
            }
            return obj;
        }
        var dbObjectsOut = [];
        events.forEach(function (event) {
            var returnValues = Object.entries(event.returnValues || {}).reduce(function (acc, _a) {
                var key = _a[0], value = _a[1];
                if (value)
                    acc[key] = value;
                return acc;
            }, {});
            var topicsOut = event.raw.topics
                .slice(1)
                .reduce(function (acc, topic, index) {
                acc["topic".concat(index + 1)] = topic;
                return acc;
            }, {});
            var dbObject = convertBigIntToString(__assign(__assign({ address: event.address + "", name: event.name || "", event: event.event + "", transactionHash: event.transactionHash + "", blockNumber: event.blockNumber + "", topic: event.event }, topicsOut), returnValues));
            dbObject = arrayToObject(dbObject);
            _this.gun.get('events').set(dbObject);
            _this.gun.get('events').get(dbObject.transactionHash).put(dbObject);
            _this.gun.get('events').get(dbObject.address).get(dbObject.topic).put(dbObject);
            dbObjectsOut.push(dbObject);
        });
        this.onSync(dbObjectsOut, isLive);
        return dbObjectsOut;
    };
    AbiSyncer.prototype.sync = function () {
        this.log("sync");
        return this.syncHistorical().then(this.syncLive);
    };
    AbiSyncer.prototype.subscribe = function (topic, callback) {
        this.log("subscribe", topic);
        return this.get(topic).map().on(callback);
    };
    AbiSyncer.prototype.get = function (name) {
        this.log("get", name);
        return this.gun.get(name);
    };
    return AbiSyncer;
}());
export default AbiSyncer;
//# sourceMappingURL=abi-syncer.js.map