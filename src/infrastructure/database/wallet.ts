import mongoose,{Document, Model, Schema} from "mongoose";
import { walletType } from "../../domain/users";

const walletSchema : Schema<walletType> = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    balance:{
        type:Number,
         default:0,
         required:true
    },
    transactions: [{
        beneficiary: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'beneficiary',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true
        },
        description: {
            type: String,
             required: true
        }
    }]
},{ timestamps: true })


const walletModel : Model<walletType> = mongoose.model<walletType>('Wallet',walletSchema)
export default walletModel;