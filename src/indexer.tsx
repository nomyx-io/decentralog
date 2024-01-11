import React, { useEffect, useState } from "react";
import Web3 from "web3";
import GUN from 'gun';
import AbiSyncer from "./abi-syncer";

import "./indexer.css";

export default function DecentralizedIndexer({ root, provider, contracts, debug, onSync}: any) {
    function log(...s: any) {
        debug && console.log(`DecentralizedIndexer:${s}`)
    }
    const [syncers, setSyncers] = useState([] as any);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [events, setEvents] = useState([] as any);
    // Initialize syncers
    useEffect(() => {
        if(!provider || !contracts || !syncers) return;
        
        const gun = GUN().get(root);
        const web3 = new Web3(provider);
        const initializeSyncers = async () => {
            log('initializeSyncers')
            try {
                setLoading(true);
                const initializedSyncers = await Promise.all(
                    Object.entries(contracts).map(async ([name, contract]: any) => {
                        if (!contract.abi || !contract.address) return null;
                        const abiSyncer = new AbiSyncer(web3, provider, gun, name, contract.abi, contract.address, debug === true, (event: any, live: any) => {
                          if(!event) return;
                          event.abiSyncer = abiSyncer;
                          onSync&&onSync(event, live);
                          log('onSync', event);
                          setEvents([...events, event]);
                        });
                        await abiSyncer.sync();
                        return { name, abiSyncer };
                    })
                );
                setSyncers(initializedSyncers.filter(syncer => syncer));
            } catch (e: any) {
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        initializeSyncers();
    }, [contracts, provider, root, onSync]);
  
    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {debug && <>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Contract</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {syncers.map((syncer: any) => (
                        <tr key={syncer.name}>
                            <td>{syncer.name}</td>
                            <td>{syncer.abiSyncer.address}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event: any) => (
                        <tr key={event.name}>
                            <td>{event.name}</td>
                            <td>{event.address}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </>
        }
        </div>
    );
  }