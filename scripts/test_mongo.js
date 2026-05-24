import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://rabbanibasha590_db_user:o2kZNFEtzAtCR0sp@cluster0.ekjvjge.mongodb.net/?appName=Cluster0";
const dbName = "orasnap";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("SUCCESS: Connected successfully to MongoDB!");
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log("Existing collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("ERROR: Failed to connect to MongoDB:", err);
  } finally {
    await client.close();
  }
}

run();
