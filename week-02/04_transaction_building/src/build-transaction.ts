
import { ccc } from "@ckb-ccc/ccc";
import { signer, render } from "@ckb-ccc/playground";

// Set to true only when sending a transaction
const SEND = false;

async function main() {
    console.log("CKBuilder - Week 02 - Exercise 04");
    console.log("=== TRANSACTION BUILDING ===");

    // 1. Get wallet information
    const address = await signer.getRecommendedAddress();
    const balance = await signer.getBalance();

    console.log("Sender:", address);
    console.log(
        "Balance:",
        ccc.fixedPointToString(balance),
        "CKB"
    );

    // 2. Create output lock script
    const { script: lock } = await ccc.Address.fromString(
        address,
        signer.client
    );

    // 3. Create transaction skeleton
    // Send 100 CKB to the same address
    const tx = ccc.Transaction.from({
        outputs: [
            {
                lock,
                capacity: ccc.fixedPointFrom("100"),
            },
        ],
    });

    console.log("Step 1: Transaction created");
    await render(tx);

    // 4. Select input cells
    await tx.completeInputsByCapacity(signer);

    console.log("Step 2: Inputs completed");
    await render(tx);

    // 5. Complete transaction fee and change
    await tx.completeFeeBy(signer);

    console.log("Step 3: Fee completed");
    await render(tx);

    // 6. Sign and send transaction
    if (SEND) {
        console.log("Waiting for wallet approval...");

        const txHash = await signer.sendTransaction(tx);

        console.log("Transaction sent!");
        console.log("Transaction Hash:", txHash);
    } else {
        console.log("Preview only. Nothing was sent.");
    }
}

await main();
