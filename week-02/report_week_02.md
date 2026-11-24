# CKBuilder — Week 2 Learning Report

* **Programme:** Community Keeps Building — Builder Track
* **Study date:** 17 November 2026
* **Environment:** Windows, Antigravity, PowerShell, TypeScript, CKB Testnet
* **Working directory:** `D:\CKBuilder\week-02\`

---

## 1. Introduction

Last week, I worked mainly on a local Devnet, where I transferred CKB, stored data in Cells, practised with xUDT and Spore, and deployed a simple Hash Lock.

This week, I focused on CCC (Common Chain Connector) and how to use it in a CKB application. I divided the Week 2 material from the Handbook into six smaller exercises, starting with the CCC Playground and ending with a simple dApp and transaction verification on Testnet.

I've included the source files and screenshots for each exercise below.

---

## 2. Development Environment

I continued working on Windows with Antigravity and PowerShell. Unlike Week 1, all the exercises this week used the public CKB Testnet rather than a local Devnet.

| Tool | Usage |
| :--- | :--- |
| **CCC Playground (`live.ckbccc.com`)** | Running TypeScript examples and building transactions |
| **`@ckb-ccc/ccc`** | Querying blockchain data and constructing transactions |
| **`@ckb-ccc/connector-react`** | Connecting a wallet to React applications |
| **UTXO Global Wallet** | Managing a Testnet account and signing transactions |
| **React, Vite, TypeScript** | Building the wallet integration page and dApp |
| **Node.js, `tsx`** | Running the verification script in PowerShell |
| **Nervos Pudge Faucet** | Getting Testnet CKB |
| **CKB Testnet Explorer** | Checking transaction details |

Both React projects ran locally at `http://localhost:5173/`. I did not write any new CKB Scripts this week. All CKB amounts in this report are Testnet funds.

---

## 3. Exercise 01 — CCC Playground

* **Folder:** [`01_ccc_playground/`](./01_ccc_playground/)

I started with a few basic queries in the CCC Playground to check the network connection and account information:

* `client.getTip()` — get the current block.
* `signer.getRecommendedAddress()` — get the account address.
* `signer.getBalance()` — get the account balance.

| Query | Result |
| :--- | :--- |
| **Network** | CKB Testnet |
| **Block number** | 23,088,624 |
| **Balance** | 11,444 CKB |

At this point, I was using the Playground's default signer, not my UTXO Global Wallet. This became important when I tried to sign a transaction in Exercise 04.

From these first queries, I learned that the Client handles blockchain queries, while the Signer gives the application access to an account and may also support signing, depending on its implementation.

* **Evidence:** [Playground query and console output](./01_ccc_playground/screenshots/01_query_chain_result.png)
* **Source:** [`src/query-chain.ts`](./01_ccc_playground/src/query-chain.ts)

---

## 4. Exercise 02 — CCC API & Cell Query

* **Folder:** [`02_ccc_api/`](./02_ccc_api/)

After checking the current block, I used `getTipHeader()` and `getBlockByNumber()` to read more detailed information, including the block hash, parent hash, timestamp and transaction count.

I then used `getTransaction()` and `getCell()` to look up a transaction and inspect its first output Cell.

| Query | Result |
| :--- | :--- |
| **Block number** | 23,088,673 |
| **Transactions in the block** | 16 |
| **Transaction status** | committed |
| **Inputs / outputs** | 1 / 1 |
| **Output capacity** | 2,301.2637976 CKB |
| **Cell data** | `0x` |
| **Type Script** | No value shown |

This exercise helped me understand OutPoints better. A transaction hash identifies a transaction, while an OutPoint identifies a particular output using the transaction hash and output index. I could read its capacity and scripts, but I still needed a separate query to check whether the Cell was live.

**Evidence:**
* [Block and header information](./02_ccc_api/screenshots/01_chain_information.png)
* [Transaction and Cell output](./02_ccc_api/screenshots/02_transaction_cell.png)

**Source:** [`src/query-chain.ts`](./02_ccc_api/src/query-chain.ts) · [`src/query-transaction.ts`](./02_ccc_api/src/query-transaction.ts)

---

## 5. Exercise 03 — Wallet Integration

* **Folder:** [`03_wallet_integration/`](./03_wallet_integration/)

For this exercise, I created a small React project with Vite and TypeScript. I installed `@ckb-ccc/connector-react`, configured `ccc.Provider` for CKB Testnet and used `useCcc()` to access the wallet connection and signer.

The page displays the wallet connection status, network, current block, account address and balance. It also allows the user to disconnect the wallet.

I connected UTXO Global Wallet successfully. The Testnet address ended in `...np2yp`, and the initial balance was `0 CKB`. After using the Testnet faucet, I checked the page again and confirmed that the balance had updated.

This was my first time using CCC's React connector. I could connect to the wallet without putting a private key in the application, and signing requests were handled by the wallet extension.

The connection prompt screenshot was captured while another tab was active. The connected page at `localhost:5173` shows the result of the local wallet integration.

**Evidence:**
* [Vite running](./03_wallet_integration/screenshots/01_app_running.png)
* [Wallet connection prompt](./03_wallet_integration/screenshots/02_wallet_connection.png)
* [Connected wallet and account information](./03_wallet_integration/screenshots/03_wallet_connected.png)

**Source:** [`03_wallet_integration/src/`](./03_wallet_integration/src/)

---

## 6. Exercise 04 — Transaction Building

* **Folder:** [`04_transaction_building/`](./04_transaction_building/)

I used the Pudge Faucet to fund my Testnet wallet. Before building the transaction, the balance shown in my wallet was `220,000 CKB`.

I returned to the CCC Playground and tried sending `100 CKB` to my own address. Since it was a self-transfer, I could test transaction building and signing without transferring funds to another account.

### Building the transaction

1. Convert my address into a Lock Script using `ccc.Address.fromString()`.
2. Create a transaction with `ccc.Transaction.from()` and set the output capacity using `ccc.fixedPointFrom("100")`.
3. Call `completeInputsByCapacity(signer)` to select the input Cells.
4. Call `completeFeeBy(signer)` to complete the fee and change.
5. Review the transaction, approve the signing request in UTXO Global Wallet and submit it.

I used `render(tx)` between the building steps to inspect how the inputs and outputs changed.

### Signing issue

My first attempt failed with this error:
> `Signer.signOnlyTransaction not implemented`

At first, I thought the wallet was already connected because I could read an address and balance in the Playground. When I checked again, I noticed that the Playground was still using its default signer with `11,444 CKB`, while my UTXO Global Wallet had `220,000 CKB` and a different address.

I connected UTXO Global directly in the Playground and checked the address and balance again. After they matched, I retried the transaction. The wallet displayed a signing request from `live.ckbccc.com`, and after I approved it, the Playground returned a transaction hash.

I ran the example more than once, so the submission screenshots may not all refer to the transaction verified below. I checked the committed status separately in Exercises 05 and 06.

* **Transaction used for verification:** `0xd262ac840dbebb666a1568a103a51e3f939e836b4abefa2b261a3d7c0f31af9e`

The saved example uses `SEND = false` to prevent accidental repeat submissions. It imports helpers from `@ckb-ccc/playground` and should be run in the Playground, not directly in Node.js.

**Evidence:**
* [Testnet faucet claim](./04_transaction_building/screenshots/01_testnet_faucet.png)
* [Wallet balance](./04_transaction_building/screenshots/02_wallet_balance.png)
* [Transaction build](./04_transaction_building/screenshots/03_transaction_build.png)
* [Wallet signing request](./04_transaction_building/screenshots/04_transaction_signing.png)
* [Transaction sent](./04_transaction_building/screenshots/05_transaction_sent.png)

**Source:** [`src/build-transaction.ts`](./04_transaction_building/src/build-transaction.ts)

---

## 7. Exercise 05 — First CKB dApp

* **Folder:** [`05_first_dapp/`](./05_first_dapp/)

I built a small CKB Transaction Explorer using React, Vite, TypeScript and CCC to practise what I had learned in the previous exercises.

The application supports:
* Connecting and disconnecting UTXO Global Wallet.
* Displaying the wallet address, balance and current block number.
* Searching for a transaction by hash using `client.getTransaction()`.
* Displaying transaction status, inputs, outputs and output capacities.
* Validating the entered hash and displaying an error if the lookup fails.

I tested the app with the same Testnet account and transaction from Exercise 04.

| Item | Result |
| :--- | :--- |
| **Connected wallet** | UTXO Global Wallet |
| **Network** | CKB Testnet |
| **Current block** | 23,089,174 |
| **Wallet balance** | 219,999.99933953 CKB |
| **Transaction status** | committed |
| **Inputs / outputs** | 2 / 2 |
| **Output 0** | 100 CKB |
| **Output 1** | 9,899.99933953 CKB |

The values were fetched from Testnet rather than hard-coded. I kept the UI simple, using a black-and-white design, and focused on getting the wallet connection and transaction queries working correctly.

The app is still a small read-only explorer. I'd like to add transaction fees and more detailed Cell information later.

**Evidence:**
* [Local Vite server](./05_first_dapp/screenshots/01_dapp_running.png)
* [Connected dApp](./05_first_dapp/screenshots/02_wallet_connected.png)
* [Transaction lookup result](./05_first_dapp/screenshots/03_transaction_lookup.png)

**Source:** [`05_first_dapp/src/`](./05_first_dapp/src/)

---

## 8. Exercise 06 — Testnet Verification

* **Folder:** [`06_testnet_verification/`](./06_testnet_verification/)

For the final exercise, I wrote a separate TypeScript script to verify the transaction outside the dApp. The script uses `@ckb-ccc/ccc` to connect to Testnet, read the transaction and check each output with `getCellLive()`.

After installing the dependencies, I ran the script in PowerShell from the exercise directory:
```powershell
npx tsx src/verify-transaction.ts
```

### Verification results

| Field | Result |
| :--- | :--- |
| **Transaction** | `0xd262ac84...f31af9e` |
| **Status** | committed |
| **Inputs / outputs** | 2 / 2 |
| **Output 0** | 100 CKB — LIVE |
| **Output 1** | 9,899.99933953 CKB — LIVE |
| **Total output capacity** | 9,999.99933953 CKB |
| **Data in both outputs** | `0x` |

Both output Cells were live at the time of the check.

I also looked up the same transaction in the CKB Testnet Explorer and compared the results with my script.

| Explorer field | Result |
| :--- | :--- |
| **Block number** | 23,089,114 |
| **Confirmations at the time of capture** | 150 |
| **Transaction size** | 504 bytes |
| **Cycles** | 1,629,517 |
| **Total input capacity** | 9,999.99950830 CKB |
| **Total output capacity** | 9,999.99933953 CKB |
| **Transaction fee** | 0.00016877 CKB |

The difference between the total input and output capacity matched the fee shown by the Explorer.

One thing I learned from this exercise is that a committed transaction and a live Cell are two different things. A transaction can be committed while its output Cells may already have been spent by a later transaction. That is why I checked both the transaction status and the live status of each output.

**Evidence:**
* [Script verification output](./06_testnet_verification/screenshots/01_transaction_verification.png)
* [Live Cell status](./06_testnet_verification/screenshots/02_live_cell_check.png)
* [CKB Explorer comparison](./06_testnet_verification/screenshots/03_explorer_verification.png)

**Source:** [`src/verify-transaction.ts`](./06_testnet_verification/src/verify-transaction.ts)

---

## 9. Challenges and Notes

The main issue this week was the signer error in Exercise 04. It took me a while to understand why the Playground could return an account balance but could not sign my transaction. Checking the address and balance in both environments helped me find the problem.

I also learned to distinguish between Playground examples and standalone TypeScript scripts. The Playground provides its own `client`, `signer` and `render` helpers, while the local verification script needs to create its own Testnet client.

When preparing the repository, I kept local build files (`dist/`), dependencies (`node_modules/`) and private wallet configuration out of Git using `.gitignore`.

---

## 10. What I Learned

Compared with Week 1, I now have a better understanding of how to work with CKB from an application. I can query blocks and Cells, connect a browser wallet, build a standard CKB transaction and check its status on Testnet.

The transaction-building exercise was a bit challenging, especially the signing part, but it helped me understand how the wallet and CCC work together. Building the small Transaction Explorer also gave me a chance to put the different CCC APIs into practice instead of using them only in separate examples.

---

## 11. Next Steps

Next, I plan to spend more time learning CKB Scripts, Rust and `ckb-debugger`. I also want to revisit the Week 1 xUDT transfer and record a confirmed transaction hash.

For the Transaction Explorer, I would like to add OutPoint lookups, live Cell status, and Lock and Type Script details. There is still a lot for me to learn, especially about script execution and transaction validation.

---

## 12. Repository Structure

| Exercise | Directory | Screenshots |
| :--- | :--- | :---: |
| **01 — CCC Playground** | [`01_ccc_playground/`](./01_ccc_playground/) | 1 |
| **02 — CCC API & Cell Query** | [`02_ccc_api/`](./02_ccc_api/) | 2 |
| **03 — Wallet Integration** | [`03_wallet_integration/`](./03_wallet_integration/) | 3 |
| **04 — Transaction Building** | [`04_transaction_building/`](./04_transaction_building/) | 5 |
| **05 — First CKB dApp** | [`05_first_dapp/`](./05_first_dapp/) | 3 |
| **06 — Testnet Verification** | [`06_testnet_verification/`](./06_testnet_verification/) | 3 |
| **Total** | **6 exercises** | **17** |

Each exercise contains its source files and screenshots. The two Vite projects have separate `package.json` files and can be run independently. The Playground examples should be run in the Playground, while the verification script can be run locally using `tsx`.
