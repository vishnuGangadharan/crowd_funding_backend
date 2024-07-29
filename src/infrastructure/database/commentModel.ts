import mongoose, {Model, model, Schema, Document} from "mongoose";
import { comments } from "../../domain/comment";


const commentSchema: Schema<comments & Document > = new Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "beneficiary",
            required: true

        },
        comment : {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User",
            required: true
        },
    },
    {timestamps: true}
)

const commentModel : Model< comments> = mongoose.model<comments>("Comment", commentSchema);
export default commentModel;