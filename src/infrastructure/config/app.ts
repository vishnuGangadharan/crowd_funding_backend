import express from 'express'
import cookieParser from 'cookie-parser'
// import session from 'express-session'
import http from 'http'
import userRoutes from '../routes/userRoutes'
import adminRoutes from '../routes/adminRoutes'
import chatRoutes from '../routes/chatRoutes'
import cors from 'cors'
import morg from 'morgan'
import { Server as SocketIOServer } from 'socket.io';
import chatModel from '../database/chatModel'
const app = express()
export const httpServer  = http.createServer(app) 
import ChatRepository from '../repository/chatRepository'
import messageModel from '../database/chatModel'
import dotenv from "dotenv"
dotenv.config();

const chatRepo = new  ChatRepository()
const corsOptions = {
    origin: process.env.CORS, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization']
  };

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true}))  
app.use(morg('dev'))


app.use('/api/user',userRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/chat',chatRoutes)





const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS,
    methods: ['GET', 'POST'],
    credentials: true, 
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', ({ userId, recipientId }) => {
    const room = [userId, recipientId].sort().join('-');
    socket.join(room);
    console.log(`User ${userId} joined room: ${room}`);
  });

  socket.on('sendMessage', async (message) => {
    const { senderId, recipientId, message: text } = message;

    const room = [senderId, recipientId].sort().join('-');

    try {
      io.to(room).emit('receiveMessage', message);
      const unreadCount = await messageModel.countDocuments({recipientId, senderId, read: false});
      io.to(room).emit('updateUnreadCount', {senderId, unreadCount})
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('markMessagesAsRead', async ({recipientId, senderId}) => {
    try {
      console.log('Received markMessagesAsRead event with recipientId:', recipientId);
      console.log("herrr");
      
      // Update all unread messages from senderId to recipientId to read:true
      await messageModel.updateMany(
        { recipientId, senderId, read: false }, 
        { $set: { read: true } }
      );
  
      // Notify the client that the unread count is now 0
      const room = [senderId, recipientId].sort().join('-');
      io.to(room).emit('updateUnreadCount', { senderId, unreadCount: 0 });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
