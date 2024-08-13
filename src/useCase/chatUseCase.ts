import { chatTypes } from "../domain/chatMessage"
import ChatRepository from "../infrastructure/repository/chatRepository"
class ChatUseCase {
    private chatRepository: ChatRepository;
    constructor(chatRepository: ChatRepository) {
        this.chatRepository = new ChatRepository();
    }

    async sendMessage(senderId: string, recipientId: string, message: string): Promise<string | null> {   
        console.log('chat use case', senderId, recipientId, message);
        
        const data = {
            senderId,
            recipientId,
            message
        }
        const response = await this.chatRepository.sendMessage(data as chatTypes);
        
        if(response){
            return response
        }
        return null;
    }

    async getMessage(senderId: string , receiverId: string ) {
        try{

            const getMessage = await this.chatRepository.getMessages(senderId, receiverId);
            if(getMessage){
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: getMessage
                    }
                }
            }

        }catch(error){
            console.log(error);
            
        }
    }
    

    async chattedUsers(senderId: string){
        try{
            const chattedUsers = await this.chatRepository.chattedUsers(senderId)
            if(chattedUsers){
                return {
                    status:200,
                    data:{
                        status:true,
                        data:chattedUsers
                    }
                }
            }
        }catch(error){
            console.log(error);
            
        }
    }

}

export default ChatUseCase