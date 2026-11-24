
import { ccc } from "@ckb-ccc/ccc";
import { client } from "@ckb-ccc/playground";

async function main() {
    console.log("=== TRANSACTION & CELL QUERY ===");

    // Select a historical Testnet block
    const block = await client.getBlockByNumber(100000);

    if (!block || block.transactions.length === 0) {
        console.log("Block or transaction not found");
        return;
    }

    const tx = block.transactions[0];
    const txHash = tx.hash();

    // Query the transaction
    const result = await client.getTransaction(txHash);

    if (!result) {
        console.log("Transaction not found");
        return;
    }

    console.log("Transaction Hash:", txHash);
    console.log("Status:", result.status);
    console.log("Inputs:", result.transaction.inputs.length);
    console.log("Outputs:", result.transaction.outputs.length);

    // Read the first output Cell
    const outPoint = ccc.OutPoint.from({
        txHash,
        index: 0,
    });

    const cell = await client.getCell(outPoint);

    if (!cell) {
        console.log("Cell not found");
        return;
    }

    console.log("=== CELL INFORMATION ===");
    console.log("Output Index:", 0);
    console.log(
        "Capacity:",
        ccc.fixedPointToString(cell.cellOutput.capacity),
        "CKB"
    );
    console.log("Lock Script:", cell.cellOutput.lock);
    console.log("Type Script:", cell.cellOutput.type);
    console.log("Cell Data:", cell.outputData);

    console.log("Query completed successfully!");
}

await main();
