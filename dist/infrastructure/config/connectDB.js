"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const beneficiaryModel_1 = __importDefault(require("../database/beneficiaryModel"));
dotenv_1.default.config();
const connectToDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongo_uri = process.env.MONGODB_URI;
        console.log(mongo_uri);
        if (mongo_uri) {
            const connection = yield mongoose_1.default.connect(mongo_uri);
            console.log(`MongoDB connected: ${connection.connection.host}`);
            //cron job
            node_cron_1.default.schedule('0 12 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                try {
                    const result = yield beneficiaryModel_1.default.updateMany({ targetDate: { $lt: today }, targetDateFinished: false }, { $set: { targetDateFinished: true } });
                    // Use modifiedCount instead of nModified
                    console.log(`Cron job executed: ${result.modifiedCount} beneficiary records updated`);
                }
                catch (error) {
                    console.error('Error in cron job:', error);
                }
            }));
        }
        else {
            console.log("MongoDB URI is not defined in the environment variables");
            process.exit(1);
        }
    }
    catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1);
    }
});
exports.default = connectToDb;
