// config/db.js
const mongoose = require("mongoose");

const connectDB = async (uriOverride) => {
  const uri = uriOverride || process.env.MONGO_URI;

  // In tests, we connect using mongodb-memory-server and pass a URI override.
  // So don't crash on import; and don't attempt to connect unless we have a URI.
  if (!uri) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    throw new Error("Missing MONGO_URI environment variable");
  }

  let retries = 1;
  const delay = 1000; // 1s backoff if you want to bump retries later

  while (retries) {
    try {
      const options = {
        serverSelectionTimeoutMS: 5000,
        // maxPoolSize: 10,
        // autoIndex: process.env.NODE_ENV !== "production",
      };

      // Optional dbName override, lets you change DB without editing URI
      if (process.env.MONGO_DB_NAME) {
        options.dbName = process.env.MONGO_DB_NAME;
      }

      await mongoose.connect(uri, options);

      console.log("[MongoDB] Connected");
      const conn = mongoose.connection;

      // Avoid registering duplicate listeners if connectDB is called multiple times
      conn.removeAllListeners("error");
      conn.removeAllListeners("disconnected");

      conn.on("error", (err) => {
        console.error("[MongoDB] Connection error:", err.message);
      });

      conn.on("disconnected", () => {
        console.warn("[MongoDB] Disconnected");
      });

      // Only register process signal handlers outside of tests
      if (process.env.NODE_ENV !== "test") {
        const gracefulShutdown = async (signal) => {
          console.log(`[MongoDB] Received ${signal}, closing connection...`);
          await conn.close();
          process.exit(0);
        };

        // Guard against duplicate handler registration
        if (!process._mongoShutdownHandlersRegistered) {
          process.on("SIGINT", () => gracefulShutdown("SIGINT"));
          process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
          process._mongoShutdownHandlersRegistered = true;
        }
      }

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
