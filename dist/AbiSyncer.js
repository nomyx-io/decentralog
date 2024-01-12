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
export var transformObject = function (obj) {
    var transformNested = function (nestedObj) {
        if (Array.isArray(nestedObj)) {
            // Convert array to object with indices as keys
            var newObj = {};
            for (var i = 0; i < nestedObj.length; i++) {
                newObj[i] = transformNested(nestedObj[i]);
            }
            return newObj;
        }
        else if (typeof nestedObj === "object" && nestedObj !== null) {
            // Traverse object properties
            for (var key in nestedObj) {
                nestedObj[key] = transformNested(nestedObj[key]);
            }
            return nestedObj;
        }
        else if (typeof nestedObj === "bigint") {
            // Convert BigInt to string
            return nestedObj.toString();
        }
        // Return other types unchanged
        return nestedObj;
    };
    // Begin transformation
    return transformNested(obj);
};
export var transformObjectToArray = function (obj) {
    // transform an objectified array back into an array
    var transformNested = function (nestedObj) {
        if (Array.isArray(nestedObj)) {
            // Convert array to object with indices as keys
            var newObj = [];
            for (var i = 0; i < nestedObj.length; i++) {
                newObj[i] = transformNested(nestedObj[i]);
            }
            return newObj;
        }
        else if (typeof nestedObj === "object" && nestedObj !== null) {
            // Traverse object properties
            for (var key in nestedObj) {
                nestedObj[key] = transformNested(nestedObj[key]);
            }
            return nestedObj;
        }
        else if (typeof nestedObj === "bigint") {
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
};
var AbiSyncer = /** @class */ (function () {
    function AbiSyncer(web3, gun, name, abi, address, debug, onSync) {
        this.debug = false;
        this.name = name;
        this.abi = abi;
        this.address = address;
        this.onSync = onSync;
        this.sync = this.sync.bind(this);
        this.web3 = web3;
        this.provider = web3.provider;
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
        // get the block height of the current block
        return this.web3.eth.getBlock("latest")
            .then(function (block) {
            var blockNumber = block.number;
            // convert to number from bigint
            blockNumber = Number(blockNumber);
            // get the events
            return _this.contract
                .getPastEvents("allEvents", {
                fromBlock: blockNumber - 1000 < 0 ? 0 : blockNumber - 1000,
                toBlock: "latest",
                address: _this.address,
            })
                .then(function (_events) {
                var tobjs = [];
                for (var _i = 0, _events_1 = _events; _i < _events_1.length; _i++) {
                    var event_1 = _events_1[_i];
                    event_1.address = _this.address;
                    event_1.name = event_1.event;
                    event_1.event = event_1.raw.topics[0];
                    event_1.transactionHash = event_1.transactionHash;
                    event_1.blockNumber = event_1.blockNumber;
                    event_1.signature = event_1.signature;
                    tobjs.push(transformObject(event_1));
                }
                _this.addRecords(tobjs, false);
                events.concat(_events);
            })
                .then(function () {
                _this.log("syncHistorical done");
                return events;
            })
                .catch(function (err) {
                console.error("error getting historical data", err.message);
            });
        });
    };
    AbiSyncer.prototype.syncLive = function () {
        var _this = this;
        this.log("syncLive", this.address);
        // listen for new events
        return (this.contract &&
            this.contract.events
                .allEvents({ fromBlock: "latest" }, function (error, event) {
                if (error) {
                    console.error("Error listening for events for contract: ".concat(_this.name), error);
                    return;
                }
                if (!event.event)
                    event.event = event.raw.topics[0];
                return _this.addRecords([event], true);
            }));
    };
    AbiSyncer.prototype.addRecords = function (events, isLive) {
        if (!events || !events.forEach)
            return;
        this.log("addRecords", events.length, isLive);
        var dbObjectsOut = [];
        events.forEach(function (event) {
            var returnValues = Object.entries(event.returnValues || {}).reduce(function (acc, _a) {
                var key = _a[0], value = _a[1];
                if (value)
                    acc[key] = value;
                return acc;
            }, {});
            var topicsOut = event.raw.topics.slice && event.raw.topics
                .slice(1)
                .reduce(function (acc, topic, index) {
                acc["topic".concat(index + 1)] = topic;
                return acc;
            }, {});
            var dbObject = __assign(__assign({ address: event.address + "", name: event.name || "", event: event.event + "", transactionHash: event.transactionHash + "", blockNumber: event.blockNumber + "", topic: event.event }, topicsOut || {}), returnValues);
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
        if (!topic)
            return;
        this.log("subscribe", topic);
        return this.get(topic).map().on(callback);
    };
    AbiSyncer.prototype.get = function (name) {
        if (!name)
            return '';
        this.log("get", name);
        return this.gun.get(name);
    };
    return AbiSyncer;
}());
export default AbiSyncer;
//# sourceMappingURL=AbiSyncer.js.map