import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || "snapzeit"; // existing data lives in the 'snapzeit' db

if (!uri) {
  console.error("MONGO_URI is not set. Create a .env file (see .env.example) with your MongoDB connection string.");
  process.exit(1);
}

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
