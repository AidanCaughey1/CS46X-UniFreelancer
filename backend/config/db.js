// config/db.js
const mongoose = require("mongoose");

if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI environment variable");
}

const connectDB = async () => {
  let retries = 1;
  const delay = 1000; // 1s backoff if you want to bump retries later

  while (retries) {
    try {
      const options = {
        serverSelectionTimeoutMS: 5000,
        // You can tweak these as needed:
        // maxPoolSize: 10,
        // autoIndex: process.env.NODE_ENV !== "production",
      };

      // Optional dbName override, lets you change DB without editing URI
      if (process.env.MONGO_DB_NAME) {
        options.dbName = process.env.MONGO_DB_NAME;
      }

      await mongoose.connect(process.env.MONGO_URI, options);

      console.log("[MongoDB] Connected");

      const conn = mongoose.connection;

      conn.on("error", (err) => {
        console.error("[MongoDB] Connection error:", err.message);
      });

      conn.on("disconnected", () => {
        console.warn("[MongoDB] Disconnected");
      });

      const gracefulShutdown = async (signal) => {
        console.log(`[MongoDB] Received ${signal}, closing connection...`);
        await conn.close();
        process.exit(0);
      };

      process.on("SIGINT", () => gracefulShutdown("SIGINT"));
      process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

      return;
    } catch (err) {
      console.error("[MongoDB] Connection error:", err.message);
      retries -= 1;
      console.log(`Retries left: ${retries}`);

      if (!retries) {
        throw err;
      }

      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;
