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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import GUN from 'gun';
import AbiSyncer from "./abi-syncer";
import "./indexer.css";
export default function DecentralizedIndexer(_a) {
    var _this = this;
    var root = _a.root, provider = _a.provider, contracts = _a.contracts, debug = _a.debug, onSync = _a.onSync;
    function log() {
        var s = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            s[_i] = arguments[_i];
        }
        debug && console.log("DecentralizedIndexer:".concat(s));
    }
    var _b = useState({}), syncers = _b[0], setSyncers = _b[1];
    var _c = useState(true), loading = _c[0], setLoading = _c[1];
    var _d = useState([]), events = _d[0], setEvents = _d[1];
    var rootNode = useState(root || Math.random().toString(36).substring(7))[0];
    var gun = useState(GUN().get(rootNode))[0];
    var _e = useState(undefined), error = _e[0], setError = _e[1];
    // Initialize syncers
    useEffect(function () {
        var isMounted = true;
        var initializeSyncers = function () { return __awaiter(_this, void 0, void 0, function () {
            var abiSyncers;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!provider || !contracts)
                            return [2 /*return*/];
                        setLoading(true);
                        abiSyncers = [];
                        try {
                            log("initializeSyncers", syncers);
                            Object.entries(contracts).forEach(function (_a) {
                                var name = _a[0], contract = _a[1];
                                if (syncers[name])
                                    return;
                                var abiSyncer = new AbiSyncer(new Web3(provider), provider, gun, name, contract.abi, contract.address, debug === true, function (_events, live) { return __awaiter(_this, void 0, void 0, function () {
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!isMounted || !_events)
                                                    return [2 /*return*/];
                                                log("onSync", JSON.stringify(_events));
                                                _a = onSync;
                                                if (!_a) return [3 /*break*/, 2];
                                                return [4 /*yield*/, onSync(_events, live)];
                                            case 1:
                                                _a = (_b.sent());
                                                _b.label = 2;
                                            case 2:
                                                _a;
                                                setEvents(function (prevEvents) { return __spreadArray(__spreadArray([], prevEvents, true), _events, true); });
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                abiSyncers.push(abiSyncer.sync());
                                setError(undefined);
                            });
                        }
                        catch (e) {
                            setError(e.message);
                        }
                        return [4 /*yield*/, Promise.all(abiSyncers).then(function (initializedSyncers) {
                                if (isMounted) {
                                    setSyncers(function (prevSyncers) { return __spreadArray(__spreadArray([], prevSyncers, true), initializedSyncers, true); });
                                    setLoading(false);
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        initializeSyncers();
        return function () {
            isMounted = false;
        };
    }, [provider, JSON.stringify(contracts)]);
    events.forEach(function (event, i) {
        if (!event.name)
            event.name = "event " + i;
    });
    return (React.createElement("div", null,
        loading && React.createElement("p", null, "Loading..."),
        error && React.createElement("p", null,
            "Error: ",
            error),
        debug && syncers && events && React.createElement(React.Fragment, null,
            React.createElement("table", { className: "table" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Contract"),
                        React.createElement("th", null, "Address"))),
                React.createElement("tbody", null, syncers && syncers.map && syncers.map(function (syncer) { return (React.createElement("tr", { key: syncer.name },
                    React.createElement("td", null, syncer.name),
                    React.createElement("td", null, syncer.abiSyncer.address))); }))),
            React.createElement("table", { className: "table" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Event"),
                        React.createElement("th", null, "Address"))),
                React.createElement("tbody", null, events && events.map(function (event) { return (React.createElement("tr", { key: event.name },
                    React.createElement("td", null, event.name),
                    React.createElement("td", null, event.address))); }))))));
}
//# sourceMappingURL=indexer.js.map