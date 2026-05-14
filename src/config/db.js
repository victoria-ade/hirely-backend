const mongoose = require('mongoose');

// Async function
const connectDB = async () => {
  try {
     // Where the actual connection happens
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // to shut down server if connection fails
    process.exit(1);
  }
};

module.exports = connectDB;