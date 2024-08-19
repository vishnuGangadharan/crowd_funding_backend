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
    // blocked: {
    //     type:Boolean,
    //     default:false,
    //     required :false
    // },  
    reason: {
        type: String,
        required: true
    },
    image: {
        type :String
    },
    comment: {
        type: String,
        required: true
    },
    count : {
        type: Number,
        default: 0
    },
   
    
},{ timestamps: true });

const PostReportModel: Model<PostReport> = model<PostReport>('PostReport', postReportSchema);
export default PostReportModel;