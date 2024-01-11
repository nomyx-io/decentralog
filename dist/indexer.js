"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var web3_1 = __importDefault(require("web3"));
var gun_1 = __importDefault(require("gun"));
var abi_syncer_1 = __importDefault(require("./abi-syncer"));
require("./indexer.css");
function DecentralizedIndexer(_a) {
    var _this = this;
    var root = _a.root, provider = _a.provider, contracts = _a.contracts, debug = _a.debug, onSync = _a.onSync;
    function log() {
        var s = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            s[_i] = arguments[_i];
        }
        debug && console.log("DecentralizedIndexer:".concat(s));
    }
    var _b = (0, react_1.useState)([]), syncers = _b[0], setSyncers = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)([]), events = _e[0], setEvents = _e[1];
    // Initialize syncers
    (0, react_1.useEffect)(function () {
        if (!provider || !contracts || !syncers)
            return;
        var gun = (0, gun_1.default)().get(root);
        var web3 = new web3_1.default(provider);
        var initializeSyncers = function () { return __awaiter(_this, void 0, void 0, function () {
            var initializedSyncers, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log('initializeSyncers');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setLoading(true);
                        return [4 /*yield*/, Promise.all(Object.entries(contracts).map(function (_a) {
                                var name = _a[0], contract = _a[1];
                                return __awaiter(_this, void 0, void 0, function () {
                                    var abiSyncer;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!contract.abi || !contract.address)
                                                    return [2 /*return*/, null];
                                                abiSyncer = new abi_syncer_1.default(web3, provider, gun, name, contract.abi, contract.address, debug === true, function (event, live) {
                                                    if (!event)
                                                        return;
                                                    event.abiSyncer = abiSyncer;
                                                    onSync && onSync(event, live);
                                                    log('onSync', event);
                                                    setEvents(__spreadArray(__spreadArray([], events, true), [event], false));
                                                });
                                                return [4 /*yield*/, abiSyncer.sync()];
                                            case 1:
                                                _b.sent();
                                                return [2 /*return*/, { name: name, abiSyncer: abiSyncer }];
                                        }
                                    });
                                });
                            }))];
                    case 2:
                        initializedSyncers = _a.sent();
                        setSyncers(initializedSyncers.filter(function (syncer) { return syncer; }));
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _a.sent();
                        setError(e_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        initializeSyncers();
    }, [contracts, provider, root, onSync]);
    return (react_1.default.createElement("div", null,
        loading && react_1.default.createElement("p", null, "Loading..."),
        error && react_1.default.createElement("p", null,
            "Error: ",
            error),
        debug && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("table", { className: "table" },
                react_1.default.createElement("thead", null,
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("th", null, "Contract"),
                        react_1.default.createElement("th", null, "Address"))),
                react_1.default.createElement("tbody", null, syncers.map(function (syncer) { return (react_1.default.createElement("tr", { key: syncer.name },
                    react_1.default.createElement("td", null, syncer.name),
                    react_1.default.createElement("td", null, syncer.abiSyncer.address))); }))),
            react_1.default.createElement("table", { className: "table" },
                react_1.default.createElement("thead", null,
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("th", null, "Event"),
                        react_1.default.createElement("th", null, "Address"))),
                react_1.default.createElement("tbody", null, events.map(function (event) { return (react_1.default.createElement("tr", { key: event.name },
                    react_1.default.createElement("td", null, event.name),
                    react_1.default.createElement("td", null, event.address))); }))))));
}
exports.default = DecentralizedIndexer;
//# sourceMappingURL=indexer.js.map