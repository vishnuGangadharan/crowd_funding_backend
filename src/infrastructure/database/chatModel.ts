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
        enum : ['text', 'image', 'video', 'audio', 'file'],
        required: true,
        default : 'text'
    },
    mediaUrl : {
        type:String,
        required: function(this: Document & { messageType: 'text' | 'image' | 'video' | 'audio' | 'file', mediaUrl: string }) {
            return this.messageType !== 'text'; 
        },
    },
    read: {
        type: Boolean,
        default: false 
    },
   
   
},{timestamps: true})


const messageModel : Model<chatTypes> = model<chatTypes>('Chat',chatSchema);
export default messageModel;



