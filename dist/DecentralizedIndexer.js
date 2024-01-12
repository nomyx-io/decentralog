import React, { useEffect, useState } from "react";
import "./indexer.css";
import DecentralizedIndexingService from "./DecentralizedIndexingService";
export default function DecentralizedIndexer(_a) {
    var web3 = _a.web3, gun = _a.gun, onSync = _a.onSync, contracts = _a.contracts;
    var _b = useState([]), records = _b[0], setRecords = _b[1];
    useEffect(function () {
        var _contracts = Object.values(contracts).filter(function (contract) { return contract.address; });
        var decentralizedIndexingService = new DecentralizedIndexingService(web3, gun, _contracts, function (_, __) { }, true);
        decentralizedIndexingService.sync();
        decentralizedIndexingService.subscribe();
        decentralizedIndexingService.get().on(function (records) {
            setRecords(records);
            onSync && onSync(records);
        });
    }, []);
    return (React.createElement("div", null,
        React.createElement("h1", null, "Records"),
        React.createElement("ul", null, records.map(function (record) {
            return (React.createElement("li", null,
                record.name,
                " ",
                record.address,
                " ",
                record.event,
                " ",
                record.transactionHash,
                " ",
                record.blockNumber,
                " ",
                record.signature));
        }))));
}
//# sourceMappingURL=DecentralizedIndexer.js.map