import  express from 'express';
import ChatUseCase from '../../useCase/chatUseCase';
import ChatController from '../../adapters/chatController';
import ChatRepository from '../repository/chatRepository';


const chatRepository = new ChatRepository();
const useCase = new ChatUseCase(chatRepository);
const chatController = new ChatController(useCase);
const chatRoutes = express.Router();

 chatRoutes.post('/send-message',(req,res,next)=> chatController.sendMessage(req,res,next))
 chatRoutes.get('/get-message',(req,res,next) => chatController.getMessage(req,res,next))

export default chatRoutes;