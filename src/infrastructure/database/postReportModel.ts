import mongoose,{Model, Schema,model} from "mongoose";
import { PostReport } from "../../domain/postReport";

const postReportSchema = new Schema<PostReport>({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'beneficiary',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    
},{ timestamps: true });

const PostReportModel: Model<PostReport> = model<PostReport>('PostReport', postReportSchema);
export default PostReportModel;