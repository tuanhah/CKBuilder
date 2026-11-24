
import { client } from "@ckb-ccc/playground";

async function main() {
    console.log("CKBuilder - Week 02 - Exercise 02");
    console.log("=== CHAIN INFORMATION ===");

    const tip = await client.getTip();
    console.log("Current block:", tip.toString());

    const header = await client.getTipHeader();

    console.log("Block hash:", header.hash);
    console.log("Parent hash:", header.parentHash);
    console.log("Block number:", header.number.toString());
    console.log("Timestamp:", header.timestamp.toString());

    const block = await client.getBlockByNumber(tip);

    if (block) {
        console.log(
            "Transactions in block:",
            block.transactions.length
        );
    }

    console.log("Query completed successfully!");
}

await main();
