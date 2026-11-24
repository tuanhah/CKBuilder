
import { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import "./App.css";

type TxResult = {
  hash: string;
  status: string;
  inputs: number;
  outputs: number;
  capacities: string[];
};

export default function App() {
  const { open, disconnect, wallet, signerInfo, client } =
    ccc.useCcc();

  const [block, setBlock] = useState("...");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<TxResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load current block
  useEffect(() => {
    let active = true;

    client.getTip()
      .then(tip => {
        if (active) setBlock(tip.toString());
      })
      .catch(() => {
        if (active) setBlock("Unavailable");
      });

    return () => {
      active = false;
    };
  }, [client]);

  // Load connected wallet information
  useEffect(() => {
    let active = true;

    setAddress("");
    setBalance("0");

    if (!signerInfo) return;

    async function loadWallet() {
      try {
        const signer = signerInfo!.signer;

        const walletAddress =
          await signer.getRecommendedAddress();

        const walletBalance =
          await signer.getBalance();

        if (!active) return;

        setAddress(walletAddress);
        setBalance(
          ccc.fixedPointToString(walletBalance)
        );
      } catch (err) {
        if (active) {
          setError(String(err));
        }
      }
    }

    void loadWallet();

    return () => {
      active = false;
    };
  }, [signerInfo]);

  // Search transaction by hash
  async function searchTransaction() {
    setError("");
    setResult(null);

    const txHash = hash.trim();

    if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
      setError("Please enter a valid transaction hash.");
      return;
    }

    setLoading(true);

    try {
      const tx = await client.getTransaction(txHash);

      if (!tx) {
        setError("Transaction not found on Testnet.");
        return;
      }

      setResult({
        hash: txHash,
        status: tx.status,
        inputs: tx.transaction.inputs.length,
        outputs: tx.transaction.outputs.length,
        capacities: tx.transaction.outputs.map(output =>
          ccc.fixedPointToString(output.capacity)
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header>
        <p className="subtitle">
          CKBuilder / Week 02 / Exercise 05
        </p>
        <h1>CKB Transaction Explorer</h1>
        <p className="description">
          A simple CKB dApp built with React and CCC SDK.
        </p>
      </header>

      <section className="card">
        <div className="row">
          <span>Network</span>
          <strong>CKB Testnet</strong>
        </div>
        <div className="row">
          <span>Wallet</span>
          <strong>
            {signerInfo
              ? wallet?.name ?? "Connected"
              : "Not connected"}
          </strong>
        </div>

        {!signerInfo ? (
          <button onClick={open}>
            Connect Wallet
          </button>
        ) : (
          <>
            <p className="field-label">Wallet Address</p>
            <p className="hash">{address || "Loading..."}</p>

            <button className="secondary" onClick={disconnect}>
              Disconnect
            </button>
          </>
        )}
      </section>

      <section className="stats">
        <div className="stat">
          <span>Current Block</span>
          <strong>{block}</strong>
        </div>
        <div className="stat">
          <span>Wallet Balance</span>
          <strong>{balance} CKB</strong>
        </div>
      </section>

      <section className="card">
        <h2>Transaction Lookup</h2>
        <p className="description">
          Search a transaction by its hash on CKB Testnet.
        </p>

        <input
          value={hash}
          onChange={e => setHash(e.target.value)}
          placeholder="0x... Transaction Hash"
        />

        <button
          onClick={() => void searchTransaction()}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search Transaction"}
        </button>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h3>Transaction Details</h3>

            <p className="field-label">Hash</p>
            <p className="hash">{result.hash}</p>

            <div className="row">
              <span>Status</span>
              <strong>{result.status}</strong>
            </div>
            <div className="row">
              <span>Inputs</span>
              <strong>{result.inputs}</strong>
            </div>
            <div className="row">
              <span>Outputs</span>
              <strong>{result.outputs}</strong>
            </div>

            <h3>Output Capacities</h3>
            {result.capacities.map((capacity, index) => (
              <div className="row" key={index}>
                <span>Output {index}</span>
                <strong>{capacity} CKB</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer>Built with CCC SDK · CKB Testnet</footer>
    </main>
  );
}
