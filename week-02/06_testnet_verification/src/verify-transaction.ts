
import { ccc } from "@ckb-ccc/ccc";

// Transaction from Week 02 - Exercise 04
const TX_HASH =
    "0xd262ac840dbebb666a1568a103a51e3f939e836b4abefa2b261a3d7c0f31af9e";

async function main() {
    const owner = ccc.ClientPublicTestnet.open();
    const client = owner.value;

    try {
        console.log("CKBuilder - Week 02 - Exercise 06");
        console.log("Network: CKB Testnet");

        // 1. Verify network connection
        const tip = await client.getTip();
        console.log("\n=== NETWORK ===");
        console.log("Current Block:", tip.toString());

        // 2. Query transaction
        console.log("\n=== TRANSACTION VERIFICATION ===");

        const result = await client.getTransaction(TX_HASH);

        if (!result) {
            console.log("Transaction not found");
            return;
        }

        const tx = result.transaction;

        console.log("Transaction Hash:", TX_HASH);
        console.log("Status:", result.status);
        console.log("Inputs:", tx.inputs.length);
        console.log("Outputs:", tx.outputs.length);

        if (result.status !== "committed") {
            console.log("Transaction is not committed yet.");
            return;
        }

        // 3. Inspect output capacities
        console.log("\n=== OUTPUT INFORMATION ===");

        let totalCapacity = 0n;

        tx.outputs.forEach((output, index) => {
            totalCapacity += output.capacity;

            console.log(
                `Output ${index}:`,
                ccc.fixedPointToString(output.capacity),
                "CKB"
            );
        });

        console.log(
            "Total Output Capacity:",
            ccc.fixedPointToString(totalCapacity),
            "CKB"
        );

        // 4. Check output Cell status
        console.log("\n=== LIVE CELL VERIFICATION ===");

        for (let index = 0; index < tx.outputs.length; index++) {
            const outPoint = ccc.OutPoint.from({
                txHash: TX_HASH,
                index,
            });

            const cell = await client.getCellLive(outPoint);

            console.log(
                `Output ${index}:`,
                cell ? "LIVE" : "NOT LIVE"
            );

            if (cell) {
                console.log(
                    "Capacity:",
                    ccc.fixedPointToString(
                        cell.cellOutput.capacity
                    ),
                    "CKB"
                );

                console.log("Cell Data:", cell.outputData);
            }
        }

        console.log("\nVerification completed!");
    } catch (error) {
        console.error("Verification failed:", error);
        process.exitCode = 1;
    } finally {
        await owner.dispose();
    }
}

void main();
