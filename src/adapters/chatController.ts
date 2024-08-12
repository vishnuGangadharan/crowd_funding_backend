import { Request, Response, NextFunction } from 'express';
import ChatUseCase from '../useCase/chatUseCase';


class ChatController {
    private chatUseCase: ChatUseCase;
    constructor(chatUseCase: ChatUseCase) {
        this.chatUseCase = chatUseCase;
    }


    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {

            const { senderId, receiverId, message } = req.body;
            const response = await this.chatUseCase.sendMessage(senderId, receiverId, message);
            // if (response ) {
            //     return res.status(response).json(response);
            // } else {
            //     return res.status(500).json({ error: 'Invalid response' });
            // }
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

}
export default ChatController;