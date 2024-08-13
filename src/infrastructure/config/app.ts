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

const chatRepo = new  ChatRepository()
const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization']
  };

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())//used to parse incomming req with json payload, transform json to js object which can access by req.body
app.use(express.urlencoded({ extended: true}))  //forms related
app.use(morg('dev'))
// app.use(session({
//     secret: 'kdjhsdfk',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }))

app.use('/api/user',userRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/chat',chatRoutes)


//new part


const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true, 
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', ({ userId, recipientId }) => {
    const room = [userId, recipientId].sort().join('-');
    socket.join(room);
    console.log(`User ${userId} join asyned room: ${room}`);
  });

  socket.on('sendMessage', async(message) => {
    const { senderId, recipientId } = message;
    const room = [senderId, recipientId].sort().join('-');
    console.log(`Sending message to room ${room}:`, message);

      const save = await chatRepo.sendMessage(message)
    io.to(room).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

