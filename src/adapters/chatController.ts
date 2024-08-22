import { Request, Response, NextFunction } from 'express';
import ChatUseCase from '../useCase/chatUseCase';


class ChatController {
    private chatUseCase: ChatUseCase;
    constructor(chatUseCase: ChatUseCase) {
        this.chatUseCase = chatUseCase;
    }


    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('kittiyi');
            if (req.files && 'file' in req.files) {
                const file = req.files.file;
                console.log("ssssss",file);
                
            }
            console.log("ddddd",req.file);
            

            const {senderId, recipientId, message } = req.body;
            console.log("seder",senderId, " receiver", recipientId,"message", message);
            const response = await this.chatUseCase.sendMessage(senderId, recipientId, message);
           if(response) res.status(200).json(response);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }



    async getMessage(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("chat get  controller", req.query.senderId, req.query.receiverId);
            const senderId = req.query.senderId as string;
            const receiverId = req.query.receiverId as string;
            const getMessage = await this.chatUseCase.getMessage(senderId, receiverId);
            if(getMessage)
            return res.status(getMessage?.status).json(getMessage?.data);
        } catch (error) {
            next(error);
        }
    }



    async chattedUsers(req:Request, res: Response , next: NextFunction) {
        try{
            
            let senderId = req.query.userID as string;
            const response = await this.chatUseCase.chattedUsers(senderId as string)
            console.log("response",response);
            if(response) res.status(response.status).json(response.data)
        }catch(error){
            next(error)
        }
    }

}
export default ChatController;