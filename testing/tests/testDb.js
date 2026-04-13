const { MongoMemoryServer } = require("mongodb-memory-server");

// IMPORTANT: use the SAME mongoose as the backend uses
const mongoose = require("../../server/node_modules/mongoose");
const connectDB = require("../../server/config/db");

let mongo;

async function connectTestDb() {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await connectDB(uri);

  // Wait until mongoose is truly connected
  await mongoose.connection.asPromise();
}

async function clearTestDb() {
  // If db isn't ready yet, just skip (or you can throw)
  const db = mongoose.connection.db;
  if (!db) return;

  const collections = await db.collections();
  for (const c of collections) {
    await c.deleteMany({});
  }
}

async function disconnectTestDb() {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  mongo = null;
}

module.exports = { connectTestDb, clearTestDb, disconnectTestDb };