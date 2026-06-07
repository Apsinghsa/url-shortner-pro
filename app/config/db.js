import mongoose from "mongoose";

async function connectDB() {
  try {
    const conn = mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected : ${(await conn).connection.host}`);
  } catch (e) {
    console.error(`Error connecting to DB : ${e.message}`);
    process.exit(1);
  }
}

export default connectDB;
