const mongoose = require("mongoose");

// Validate environment variables 
if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI environment variable");
}

// NEW added retry logic
const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    if (retries === 0) throw err;
    console.error("Retrying MongoDB connection...");
    setTimeout(() => connectDB(retries - 1), 3000);
  }
};


module.exports = connectDB;