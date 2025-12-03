import mongoose from "mongoose";

const dbConfig = async () => {
  console.log("in db", process.env.MONGODB_URL);
  
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Database connected successfully");
};

export default dbConfig;
