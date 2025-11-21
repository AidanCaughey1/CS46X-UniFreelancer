const mongoose = require("mongoose");

if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI environment variable");
}

const connectDB = async () => {
  let retries = 1;
  const delay = 0;

  while (retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected");
      return;
    } catch (err) {
      console.error("MongoDB connection error:", err.message);
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
