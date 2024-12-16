import express from 'express'
import cookieParser from 'cookie-parser'
import http from 'http'
import userRoutes from '../routes/userRoutes'
import adminRoutes from '../routes/adminRoutes'
import chatRoutes from '../routes/chatRoutes'
import cors from 'cors'
import morgan from 'morgan'
import { Server as SocketIOServer } from 'socket.io';
const app = express()
export const httpServer = http.createServer(app)
import ChatRepository from '../repository/chatRepository'
import messageModel from '../database/chatModel'
import dotenv from "dotenv"
const mongoose = require('mongoose'); 
dotenv.config();

const chatRepo = new ChatRepository()
console.log( process.env.CORS_VERSAL);

const corsOptions = {
  origin: ['https://crowd-funding-hope-springs.vercel.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions))
app.options('*', cors(corsOptions));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))


app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/chat', chatRoutes)





const io = new SocketIOServer(httpServer, {
  cors: {
    origin:  process.env.CORS_LOCAL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

type User = {
  userId: string;
  socketId: string;
};


let onlineUsers: User[] = [];


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('addNewUser', (userId ,recipientId) =>{
    console.log('room', userId, recipientId);
    const room = [userId, recipientId].sort().join('-');

    !onlineUsers.some((user) => user.userId === userId) && 
    onlineUsers.push({
      userId,
      socketId: socket.id
    })
    console.log('onlineUsers', onlineUsers);
    io.emit('getOnlineUsers', onlineUsers);
  })

  socket.on('userLeftChat', async(userId, time) => {
    console.log(`User left chat: ${userId} at time ${time}`);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId:', userId);
      return;
  }
  console.log('userId:..................', userId);
  io.emit('userLastSeen',{ userId, lastSeen: time});
  
  const objectId = new mongoose.Types.ObjectId(userId);

      chatRepo.updateLastSeen(objectId)

      onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    console.log('onlineUsers after user left chat:', onlineUsers);
    io.emit('getOnlineUsers', onlineUsers);
  });
  

  socket.on('joinRoom', ({ userId, recipientId }) => {
    const room = [userId, recipientId].sort().join('-');
    socket.join(room);
    console.log(`User ${userId} joined room: ${room}`);
  });

  socket.on('typing', ({ senderId, recipientId }) => {
    
    const room = [senderId, recipientId].sort().join('-');
    socket.to(room).emit('typing', { senderId });
  });
  
  socket.on('stopTyping', ({ senderId, recipientId }) => {
    
    const room = [senderId, recipientId].sort().join('-');
    socket.to(room).emit('stopTyping', { senderId });
  });
  

  socket.on('sendMessage', async (message) => {
    const { senderId, recipientId, message: text } = message;

    const room = [senderId, recipientId].sort().join('-');

    try {
      
      io.to(room).emit('receiveMessage', message);
      console.log('Received message:', message);
     
      const unreadCount = await messageModel.countDocuments({ recipientId, senderId, read: false });
      io.to(room).emit('updateUnreadCount', { senderId, unreadCount: unreadCount+1 })
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('markMessagesAsRead', async ({ recipientId, senderId }) => {
    try {
      console.log('Received markMessagesAsRead event with recipientId:', recipientId);
      
      await messageModel.updateMany(
        { recipientId, senderId, read: false },
        { $set: { read: true } }
      );
      
      const room = [senderId, recipientId].sort().join('-');
      io.to(room).emit('updateUnreadCount', { senderId, unreadCount: 0 });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.find((user) => user.socketId == socket.id)

      console.log('logout user is ...................',user?.userId);
    console.log('User disconnected:', socket.id);
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
    console.log('onlineUsers after disconnect:', onlineUsers);
    io.emit('getOnlineUsers', onlineUsers);
  });
});

