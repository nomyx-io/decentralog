import React, { useEffect, useState } from "react";

import "./indexer.css";
import DecentralizedIndexingService from "./DecentralizedIndexingService";

export default function DecentralizedIndexer({ web3, gun, onSync, contracts }: any) {
    const [records, setRecords] = useState([]);
    useEffect(() => {
      const _contracts = Object.values(contracts).filter(
        (contract: any) => contract.address
      );
      const decentralizedIndexingService = new DecentralizedIndexingService(
        web3,
        gun,
        _contracts,
        (_: any, __: any) => {},
        true
      );
      decentralizedIndexingService.sync();
      decentralizedIndexingService.subscribe();
      decentralizedIndexingService.get().on((records: any) => {
        setRecords(records);
        onSync && onSync(records);
      });
    }, []);
    return (
      <div>
        <h1>Records</h1>
        <ul>
          {records.map((record: any) => {
            return (
              <li>
                {record.name} {record.address} {record.event}{" "}
                {record.transactionHash} {record.blockNumber} {record.signature}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
