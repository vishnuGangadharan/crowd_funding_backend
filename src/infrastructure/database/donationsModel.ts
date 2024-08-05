import mongoose, {Model, Schema,model} from "mongoose";
import { Donations } from "../../domain/donations";


const donationSchema = new Schema <Donations>({
    beneficiaryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "beneficiary",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    anonymousName: {
        type: String,
        
    }
},{timestamps:true})


const DonationModel: Model<Donations> = model<Donations>('Donations', donationSchema);
export default DonationModel;


