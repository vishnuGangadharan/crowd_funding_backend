import { chatTypes } from "../../domain/chatMessage";
import ChatRepo from "../../useCase/interface/chatRepo";
import messageModel from "../database/chatModel";


class ChatRepository implements ChatRepo{
    

    sendMessage(data: chatTypes): Promise<chatTypes | null> {
        const newMessage = new messageModel(data)
        const saveMessage = newMessage.save();
        console.log('saved');
        
        return saveMessage;
    }

    getMessages(senderId: string, receiverId: string): Promise<chatTypes[] | null> {
        const messages = messageModel.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        })
        return messages;
    }
}

export default ChatRepository;