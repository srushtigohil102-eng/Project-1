import mongoose from "mongoose";
import { connectDB } from "../config/db";

async function verifyIndexes() {
  try {
    await connectDB();

    console.log("\n📊 INDEX VERIFICATION\n");
    console.log("=".repeat(60));

    // Get DB handle and all collections (guard against undefined)
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("No database connection available on mongoose.connection.db");
    }

    // Get all collections
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const indexes = await coll.indexes();
      
      console.log(`\n📁 Collection: ${collection.name}`);
      console.log("-".repeat(40));
      
      indexes.forEach((idx) => {
        console.log(`  ✅ ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Index verification complete!");
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    await mongoose.disconnect();
  }
}

verifyIndexes();