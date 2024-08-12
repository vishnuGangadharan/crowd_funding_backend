import { chatTypes } from "../domain/chatMessage"
import ChatRepository from "../infrastructure/repository/chatRepository"
class ChatUseCase {
    private chatRepository: ChatRepository;
    constructor(chatRepository: ChatRepository) {
        this.chatRepository = new ChatRepository();
    }

    async sendMessage(senderId: string, receiverId: string, message: string): Promise<chatTypes | null> {   
        console.log('chat use case', senderId, receiverId, message);
        
        const data = {
            senderId,
            receiverId,
            message
        }
        const response = await this.chatRepository.sendMessage(data as chatTypes);
        
        // if(response){
        //     return {
        //         status: 200,
        //         data:{
        //             message: 'message sent successfully',
        //             data: response
        //         }
        //     }
        // }
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
    

}

export default ChatUseCase