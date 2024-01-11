import React, { useEffect, useState } from "react";
import Web3 from "web3";
import GUN from 'gun';
import AbiSyncer from "./abi-syncer";

import "./indexer.css";

export default function DecentralizedIndexer({
    root,
    provider,
    contracts,
    debug,
    onSync
}: any) {
    function log(...s: any) {
        debug && console.log(`DecentralizedIndexer:${s}`);
    }
    const [syncers, setSyncers] = useState({} as any);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([] as any);
    const [rootNode] = useState(root || Math.random().toString(36).substring(7));
    const [gun] = useState(GUN().get(rootNode));
    const [error, setError] = useState(undefined as any);
    // Initialize syncers
    useEffect(() => {
        let isMounted = true;

        const initializeSyncers = async () => {
            if (!provider || !contracts) return;
            setLoading(true);
            const abiSyncers: any = [];
            try {
                log("initializeSyncers", syncers);
                Object.entries(contracts).forEach(([name, contract]: any) => {
                    if (syncers[name]) return;
                    const abiSyncer = new AbiSyncer(
                        new Web3(provider),
                        provider,
                        gun,
                        name,
                        contract.abi,
                        contract.address,
                        debug === true,
                        async (_events: any, live: boolean) => {
                            if (!isMounted || !_events) return;
                            log("onSync", JSON.stringify(_events));
                            onSync && (await onSync(_events, live));
                            setEvents((prevEvents: any) => [...prevEvents, ..._events]);
                        }
                    );
                    abiSyncers.push(abiSyncer.sync());
                    setError(undefined);
                });
            } catch (e) {
                setError(e.message);
            }
            await Promise.all(abiSyncers).then((initializedSyncers) => {
                if (isMounted) {
                    setSyncers((prevSyncers: any) => [...prevSyncers, ...initializedSyncers]);
                    setLoading(false);
                }
            });
        };

        initializeSyncers();

        return () => {
            isMounted = false;
        };
    }, [provider, JSON.stringify(contracts)]); 

    events.forEach((event: any, i: number) => {
        if (!event.name) event.name = "event " + i;
    });

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {debug && syncers && events && <>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Contract</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {syncers && syncers.map && syncers.map((syncer: any) => (
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
                        {events && events.map((event: any) => (
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
