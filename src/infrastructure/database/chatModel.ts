import mongoose,{Document, Model, model, Schema} from "mongoose";
import { chatTypes } from "../../domain/chatMessage";

const chatSchema: Schema = new Schema({
    senderId :{
        type :mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    recipientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    message: {
        type: String
    },
    messageType : {
        type : String,
        enum : ['text', 'image', 'video' ],
        required: true,
        default : 'text'
    }
},{timestamps: true})



const messageModel : Model<chatTypes> = model<chatTypes>('Chat',chatSchema);
export default messageModel;



