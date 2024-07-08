import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


const connectToDb = async () => {
    try {
        
        const mongo_uri = process.env.MONGODB_URI;
        console.log(mongo_uri);
        if (mongo_uri) {
            const connection = await mongoose.connect(mongo_uri);
            console.log(`MongoDB connected: ${connection.connection.host}`);
        } else {
            console.log("MongoDB URI is not defined in the environment variables");
            process.exit(1);
        }
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1);
    }
};

export default connectToDb;
