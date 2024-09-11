import { chatTypes,lastSeen } from "../../domain/chatMessage";

interface ChatRepo{
     sendMessage(data:chatTypes):Promise<string>
    getMessages(senderId:string,receiverId:string):Promise<chatTypes[] | null>
    chattedUsers(senderId:string ):Promise< any | null>
    updateLastSeen(userId:string):Promise<void>
    lastSeen():Promise<lastSeen[]| null>
}

export default ChatRepo;