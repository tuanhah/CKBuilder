# CKBuilder Week 1 — Local Transaction Dashboard

A small, read-only web dashboard to inspect OffCKB local Devnet transactions, inputs, outputs and lock scripts.

## Run on Windows / Antigravity

1. Run `offckb node` in one terminal. Do not reset the chain.
2. Open this dashboard folder in Antigravity IDE.
3. Run `node server.js` in a second terminal.
4. Open http://127.0.0.1:3456 in your browser.
5. Paste your transaction hash and select **Verify transaction**.

No `npm install` is required (Node.js >=20). Only `get_transaction`, `get_tip_block_number` and `get_live_cell` are allowed by the proxy. The server listens on localhost, not the public internet. Never enter a private key.

To stop the dashboard, press Ctrl+C in the `node server.js` terminal.

To include screenshots in your CKBuilder GitHub report, capture the status and the Input/Output Cells with Lock Script fields. If a transaction has been deleted due to resetting Devnet, previous transaction hashes will no longer work.
