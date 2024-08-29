import { chatTypes } from "../../domain/chatMessage";

interface ChatRepo{
     sendMessage(data:chatTypes):Promise<string>
    getMessages(senderId:string,receiverId:string):Promise<chatTypes[] | null>
    chattedUsers(senderId:string ):Promise< any | null>
}

export default ChatRepo;