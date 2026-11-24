import { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import "./App.css";

function App() {
  const { wallet, open, disconnect, client } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [tip, setTip] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    if (!signer) {
      setAddress("");
      setBalance("");
      return;
    }

    (async () => {
      try {
        setError("");
        const [addr, bal, tipNum] = await Promise.all([
          signer.getRecommendedAddress(),
          signer.getBalance(),
          client.getTip(),
        ]);

        if (isMounted) {
          setAddress(addr);
          setBalance(ccc.fixedPointToString(bal));
          setTip(tipNum.toString());
        }
      } catch (err: any) {
        console.error("Error fetching wallet info:", err);
        if (isMounted) {
          setError(err?.message || "Failed to fetch wallet info");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [signer, client]);

  return (
    <div className="container">
      <header>
        <div className="subtitle">CKBuilder — Week 02</div>
        <h1>Wallet Integration</h1>
        <p className="description">
          Connect your CKB wallet using Common Chain Connector (CCC)
        </p>
      </header>

      <div className="wallet-card">
        <div className="row">
          <span>Network</span>
          <strong>Testnet</strong>
        </div>

        <div className="row">
          <span>Wallet Status</span>
          <strong>{wallet ? `Connected (${wallet.name})` : "Disconnected"}</strong>
        </div>

        {tip && (
          <div className="row">
            <span>Current Block</span>
            <strong>{tip}</strong>
          </div>
        )}

        {wallet && address ? (
          <>
            <div className="info">
              <label>Address</label>
              <p>{address}</p>
            </div>

            <div className="info">
              <label>Balance</label>
              <h2>{balance} CKB</h2>
            </div>

            <button className="disconnect" onClick={disconnect}>
              Disconnect
            </button>
          </>
        ) : (
          <button onClick={open}>Connect Wallet</button>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      <footer>
        <p>Built with CCC Connector React</p>
      </footer>
    </div>
  );
}

export default App;
