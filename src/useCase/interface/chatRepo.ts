import { chatTypes } from "../../domain/chatMessage";

interface ChatRepo{
     sendMessage(data:chatTypes):Promise<chatTypes | null>
    getMessages(senderId:string,receiverId:string):Promise<chatTypes[] | null>
    // getChats(userId:string):Promise<chatTypes[] | null>
}

export default ChatRepo;