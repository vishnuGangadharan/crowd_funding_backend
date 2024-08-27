import mongoose,{Document,model, Model,Schema} from "mongoose";
import { profit } from "../../domain/users";

const profitSchema : Schema<profit> = new Schema({
   
    totalProfit: {
        type: Number,
        required: true,
        default: 0
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
        date: {
            type: Date,
            default: Date.now
        }
    }]
},{ timestamps: true })

const profitModel : Model<profit> = mongoose.model<profit>('Profit',profitSchema)
export default profitModel;