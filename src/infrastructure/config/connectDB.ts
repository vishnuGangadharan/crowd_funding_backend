import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from 'node-cron';
import beneficiaryModel from "../database/beneficiaryModel";
dotenv.config();


const connectToDb = async () => {
    try {
        
        const mongo_uri = process.env.MONGODB_URI;
        console.log(mongo_uri);
        if (mongo_uri) {
            const connection = await mongoose.connect(mongo_uri);
            console.log(`MongoDB connected: ${connection.connection.host}`);

            //cron job
            cron.schedule('0 12 * * *', async () => {
                    const today = new Date();
                    try {
                        const result = await beneficiaryModel.updateMany(
                            { targetDate: { $lt: today }, targetDateFinished: false },
                            { $set: { targetDateFinished: true } }
                        );
            
                        // Use modifiedCount instead of nModified
                        console.log(`Cron job executed: ${result.modifiedCount} beneficiary records updated`);
                } catch (error) {
                    console.error('Error in cron job:', error);
                }
            });


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
