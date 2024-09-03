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
dotenv.config();

const chatRepo = new ChatRepository()
const corsOptions = {
  origin:  ['https://crowd-funding-frontend-phi.vercel.app', 'http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))


app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/chat', chatRoutes)





const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['https://crowd-funding-frontend-phi.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

type Room = string;
type UserId = string;
type RoomUsers = {
  [key: Room]: Set<UserId>;
};

const roomUsers: RoomUsers = {}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', ({ userId, recipientId }) => {
    const room = [userId, recipientId].sort().join('-');
    socket.join(room);
    console.log(`User ${userId} joined room: ${room}`);

    if(!roomUsers[room]){
      roomUsers[room] = new Set()
    }
    roomUsers[room].add(userId)
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
      const isRecipientInRoom = roomUsers[room] && roomUsers[room].has(recipientId);
      if(!isRecipientInRoom){

        const unreadCount = await messageModel.countDocuments({ recipientId, senderId, read: false });
        io.to(room).emit('updateUnreadCount', { senderId, unreadCount: unreadCount+1 })
      }
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
    console.log('User disconnected:', socket.id);
    for (const room in roomUsers) {
      roomUsers[room].delete(socket.id);

      // If the room is empty, remove the room entry
      if (roomUsers[room].size === 0) {
        delete roomUsers[room];
      }
    }
  });
});
