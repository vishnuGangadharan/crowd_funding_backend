import mongoose, { Model, Schema, Document } from "mongoose";
import { updates } from "../../domain/interface";

const updateSchema : Schema<updates & Document> = new Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "beneficiary",
            required: true
        },
        content:{
            type: [String],
            required: true
        },
        image :{
            type: [String],
            default: []
        },
        video :{
            type: [String],
            default: []
        }
    },
    {timestamps: true}
)

const updateModel : Model<updates> = mongoose.model<updates>('Update', updateSchema);
export default updateModel;