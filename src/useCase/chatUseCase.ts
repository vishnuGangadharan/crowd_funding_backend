import { chatTypes } from "../domain/chatMessage"
import ChatRepository from "../infrastructure/repository/chatRepository"
import Cloudinary from "../infrastructure/services/cloudinary";

class ChatUseCase {
    private chatRepository: ChatRepository;
    private cloudinary: Cloudinary;
    constructor(
        chatRepository: ChatRepository,
        cloudinary: Cloudinary,
    ) {
        this.chatRepository = new ChatRepository();
        this.cloudinary =  cloudinary
    }

    async sendMessage(senderId: string, recipientId: string, message?: string, fileType?:'text'| 'image' | 'video' | 'audio' | 'file',path?:string): Promise<string | null> {   
        console.log('chat use case', senderId, recipientId, message);
        let cloudinary: string | undefined;
        if (path && fileType) {
            if (fileType === 'image') {
                cloudinary = await this.cloudinary.uploadImage(path, 'message');
            } else if (fileType === 'video') {
                cloudinary = await this.cloudinary.uploadSingleVideo(path, 'message');
            }else if(fileType === 'audio'){
                cloudinary = await this.cloudinary.uploadAudio(path, 'message');
            }
        }
        
        
        
        const data : chatTypes= {
            senderId,
            recipientId,
            message : message ,
            ...(cloudinary && {mediaUrl:cloudinary, messageType:fileType})
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

    async lastSeen(){
        try{
            const  lastSeen = await this.chatRepository.lastSeen()
            if(lastSeen){
                return {
                    status:200,
                    data:{
                        status:true,
                        data:lastSeen
                    }
                }
            }
        }catch(error){
            console.log(error);

        }
    }

}

export default ChatUseCase