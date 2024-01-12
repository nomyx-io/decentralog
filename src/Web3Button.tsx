import React, { useEffect, useState } from "react";
import Web3 from "web3";

import "./Web3Button.css";

// this is a 'connect with web3' button. it shows a button that when clicked, will connect to the user's web3 provider. The button takes a title, a callback, and style props and calls the callback with the connected web3 provider.
// the callback should be a function that takes a web3 provider as an argument and returns a promise. the promise should resolve to an object with the following properties:
// - address: the user's address
// - signature: the signature of the user's address
// - message: the message that was signed
// - provider: the web3 provider
// - web3: the web3 instance

export default function Web3Button({
    title,
    callback,
    style,
    disabled,
    ...props
}: {
    title: string;
    callback: (provider: any) => Promise<any>;
    style?: any;
    disabled?: boolean;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(undefined as any);
    const [provider, setProvider] = useState(undefined as any);

    useEffect(() => {
        let isMounted = true;
        const windowEthereum = (window as any).ethereum;

        const initializeProvider = async () => {
            if (!windowEthereum) return;
            setLoading(true);
            try {
                const _provider = new Web3(windowEthereum);
                await windowEthereum.enable();
                if (isMounted) {
                    setProvider(_provider);
                    setError(undefined);
                }
            } catch (e) {
                setError(e.message);
            }
            setLoading(false);
        };
        initializeProvider();
        return () => {
            isMounted = false;
        };
    }, []);

    const connect = async () => {
        if (!provider) return;
        setLoading(true);
        try {
            const result = await callback(provider);
            setError(undefined);
            setLoading(false);
            return result;
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    return (
        <div className="web3-button" style={style} {...props}>
            <button onClick={connect} disabled={disabled || loading}>
                {loading ? "Loading..." : title}
            </button>
            {error && <div className="error">{error}</div>}
        </div>
    );
}
