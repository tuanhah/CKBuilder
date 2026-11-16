# CKBuilder — Week 1 Learning Report

* **Programme:** Community Keeps Building — Builder Track
* **Date:** 15 November 2026
* **Development environment:** Windows, Antigravity, PowerShell and a local CKB Devnet
* **Working directory:** `D:\CKBuilder\week-01`

---

## 1. A brief look back

During my first week with CKBuilder, I wanted to move beyond reading the documentation and see how CKB behaves when a transaction is actually submitted. I started with the local development setup, then worked through the five beginner exercises: transferring CKB, storing data in a Cell, issuing an xUDT, creating a DOB and building a simple Lock Script.

I tried to check each result against the blockchain rather than relying entirely on what the sample application displayed. To do that, I used a small local transaction dashboard connected to OffCKB's RPC proxy. It helped me inspect the transaction status, Cell inputs and outputs, capacity and script information. The notes below reflect what I was able to verify, as well as the parts I still need to revisit.

---

## 2. Development environment

I completed the exercises on Windows using Antigravity and its integrated PowerShell terminal. OffCKB provided a local Devnet, so I could experiment without using real funds.

| Tool | Version / address |
| :--- | :--- |
| **Git** | 2.53.0.windows.2 |
| **Node.js** | v24.14.1 |
| **npm** | 11.11.0 |
| **pnpm** | 11.5.1 |
| **OffCKB** | 0.4.13 |
| **CKB node (via OffCKB)** | 0.208.0 |
| **Cargo** | 1.100.0 |
| **ckb-debugger** | 1.1.1 |
| **CKB RPC** | `http://127.0.0.1:8114` |
| **OffCKB RPC proxy** | `http://127.0.0.1:28114` |

The Devnet accounts were available through `offckb accounts`, with an initial allocation of 42,000,000 CKB per test account. I kept the same Devnet running across the exercises so that I could return to earlier transactions when needed.

---

## 3. Exercise 1 — Transfer CKB

I began with the Simple Transfer dApp at `localhost:1234`. I sent 62 CKB from the first funded Devnet account to another test address, then looked up the transaction in the dashboard.

* **Transaction:** `0xba6592d1cd8b7c5a39a428fda232204b07ee4874deea8b01aa9a4d47ba83854a`

| Verified detail | Result |
| :--- | :--- |
| **Transaction status** | committed |
| **Inputs / outputs** | 1 / 2 |
| **Recipient output** | 62 CKB |
| **Change output** | 41,999,837.9999907 CKB |
| **Transaction fee** | 0.00000465 CKB |

Seeing one Cell consumed and two new Cells created made the Cell Model easier to understand. I could also see that the recipient's Lock Script arguments differed from those of the change Cell, which remained under the sender's lock.

At first, the change in the rounded balance shown by the dApp was confusing. The dashboard gave me a clearer answer: the fee for this particular transaction was the difference between total input and output capacity, not the entire decrease shown in the simplified balance view.

---

## 4. Exercise 2 — Store Data on Cell

In this exercise, I used the Store Data on Cell example to write a short message and read it back. It was my first practical look at the data field of a Cell rather than just its CKB capacity.

* **Transaction:** `0x0a4f47eacf21131cfa378dede1e80cdd09e46001a581c932d27f7c07e2e0a18d`

The transaction was committed, with one input, two outputs and a verified fee of 0.00000575 CKB. The dashboard displayed the message as hexadecimal data in an output Cell. Back in the dApp, the Read action returned the message beginning:

> `Hello Nervos CKB! This is my second CKBuilder exercise.`

The readback page showed “Message read.” It also displayed the sentence twice. I have left that detail here because it is what I observed; I would like to check whether the duplication comes from the example's rendering logic. The write, on-chain storage and readback operations were all demonstrated.

---

## 5. Exercise 3 — Create a fungible token (xUDT)

The xUDT example helped me distinguish between CKB capacity and a custom token balance. I issued 1,000 units of a test token and queried the resulting token Cell by its xUDT arguments.

* **Issuance transaction:** `0x7e9f9ff8a2cba7747e88df8849dd7a9d49720177b6eb694223d8d6fdc8277f47`
* **xUDT arguments:** `0x7de82d61a7eb2ec82b0dc653e558ba120efcbfbb44dac87c12972d05bf25065300000000`

| Issuance check | Result |
| :--- | :--- |
| **Transaction status** | committed |
| **Issued amount** | 1,000 xUDT |
| **Inputs / outputs** | 1 / 2 |
| **Token Cell capacity** | 146 CKB |
| **Transaction fee** | 0.00000606 CKB |
| **Encoded token amount** | `0xe803...` (1,000, little-endian) |

I then constructed a transfer for 100 xUDT. The transaction JSON contained two inputs and three outputs, including a recipient Cell for 100 tokens and a change Cell for 900 tokens. This helped me see how token quantities are represented in Cell data and validated through a Type Script.

I should be precise about the result: the issuance was confirmed on-chain, but I have not yet recorded a separate committed hash for the 100-token transfer. I will verify that step before describing it as a completed transfer.

---

## 6. Exercise 4 — Create a digital object (DOB)

For the DOB exercise, I uploaded a small image through the Spore example and used Check Spore Content to retrieve it. The successful upload used the file `anh.webp` (14,570 bytes).

* **Transaction:** `0x7b50ec4f387a9dc55f343e82149cb8a2e72dc215ddd9b7716594630776878f05`

The dashboard confirmed the transaction as committed. It had one input and two outputs, a DOB output of 14,731 CKB, and a fee of 0.00015479 CKB. The output contained a Spore Type Script and non-empty Cell data. More importantly, the application was able to display the image after reading the Cell.

An earlier attempt had returned `cell not found` during the read step, despite a committed transaction. I did not count that as a successful read. The later upload worked, and I kept its evidence separately. I also noticed that the rendered result reported `contentType: image/jpeg`, although the selected file was named `.webp`. That would be worth checking if I develop something beyond the tutorial.

---

## 7. Exercise 5 — Build a Simple Lock

The final exercise took more effort because it involved building and deploying a custom script rather than only using a prepared dApp. After resolving a few Windows-specific setup issues, I compiled `hash-lock.bc`, deployed it to Devnet and started the Simple Hash Lock frontend at `localhost:3000`.

I used `Hello World` as the sample preimage, created a Hash Lock address and deposited 300 CKB. I then revealed the same preimage to send 99 CKB to another Devnet address.

* **Deployment transaction:** `0x66e7d89227a1fb692c422e7b4c376b64146ed08cd9a22d563d55e56389439599`
* **Unlock transaction:** `0x5bae32c792be3ceadc3c05e7fd3df9cdd52701b035a5754ccb7e198c32105b77`

| Unlock check | Result |
| :--- | :--- |
| **Transaction status** | committed |
| **Input Cell** | 300 CKB |
| **Recipient output** | 99 CKB |
| **Change output** | 200.99999506 CKB |
| **Transaction fee** | 0.00000494 CKB |
| **Inputs / outputs** | 1 / 2 |

The result made the purpose of a Lock Script much clearer to me: the Cell could be spent by providing the preimage expected by the script. I also noticed the warning in the example. It sends the remaining CKB back to the same Hash Lock, even though the preimage has now been revealed. That is acceptable for this local exercise, but it would not be a safe choice for real funds.

---

## 8. Problems I worked through

The Simple Lock setup was where I spent the most time troubleshooting. `pnpm` initially blocked build scripts for packages such as `esbuild`, `secp256k1` and `unrs-resolver`. I reviewed the packages, allowed the required scripts with `pnpm approve-builds` and repeated the installation. The contract then built successfully.

The first deployment command was more confusing: it rebuilt the contract and exited without deploying anything or showing an error. On Windows, the entry-point check in `scripts/deploy.js` did not call `main()` as expected due to path differences. I adjusted the entry point and ran `node scripts/deploy.js --network devnet`. This time, the transaction was committed and the deployment files were synchronized with the frontend.

I also had to learn to distinguish a transaction being submitted, a transaction being committed, and an application successfully reading the resulting Cell. The DOB issue and the xUDT transfer check are useful reminders that these are not always the same thing.

---

## 9. What I took away from Week 1

The biggest change in my understanding is how I now think about blockchain state on CKB. Instead of imagining a balance being edited directly, I can follow the inputs that are consumed and the outputs that replace them. Capacity, Lock Scripts, Type Scripts and Cell data are no longer just terms from the documentation; I have seen each of them in a transaction that I worked with.

There is still a lot for me to learn, especially around script execution and application design. Nevertheless, completing these exercises has given me a more useful foundation than reading the concepts on their own. I appreciate the guidance and feedback that have helped me work through the unfamiliar parts.

---

## 10. Plans for Week 2

Next week, I would like to spend more time with CCC (Common Chain Connector) and understand how a TypeScript application queries Cells, prepares transactions and submits them. I also plan to use `ckb-debugger` to look more closely at how CKB Scripts execute. Before moving on, I will return to the 100-token xUDT transfer and obtain its own confirmed transaction result.

---

## Screenshots and notes

The supporting screenshots are organized by exercise under [`screenshots/`](./screenshots/):

* [Environment](./screenshots/environment/)
* [Transfer CKB](./screenshots/transfer-ckb/)
* [Store Data on Cell](./screenshots/store-data-on-cell/)
* [xUDT (Fungible Token)](./screenshots/fungible-token/)
* [DOB (Digital Object)](./screenshots/create-dob/)
* [Simple Lock](./screenshots/simple-lock/)

> **Note:** All transactions described here were carried out on local Devnet, not Mainnet. Before publishing this report, any private keys visible in the example dApp screenshots must be fully covered.
