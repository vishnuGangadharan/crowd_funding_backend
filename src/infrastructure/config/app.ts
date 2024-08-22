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

// original noo change in below


// const io = new SocketIOServer(httpServer, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//     credentials: true, 
//   },
// });

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.on('joinRoom', ({ userId, recipientId }) => {
//     const room = [userId, recipientId].sort().join('-');
//     socket.join(room);
//     console.log(`User ${userId} joined room: ${room}`);
//   });

//   socket.on('sendMessage', async (message) => {
//     const { senderId, recipientId, message: text } = message;

//     const room = [senderId, recipientId].sort().join('-');
//     console.log(`Sending message to room ${room}:`, message);

//     try {
//       // const save = await chatRepo.sendMessage(message); // Save the message to the database
//       io.to(room).emit('receiveMessage', message); // Emit the message to the room
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });


//original no change on above







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
    console.log(`User ${userId} joined room: ${room}`);
  });

  socket.on('sendMessage', async (message) => {
    const { senderId, recipientId, message: text } = message;

    const room = [senderId, recipientId].sort().join('-');
    console.log(`Sending message to room ${room}:`, message);

    try {
      // const save = await chatRepo.sendMessage(message); // Save the message to the database
      io.to(room).emit('receiveMessage', message); // Emit the message to the room
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// const io = new SocketIOServer(httpServer, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//     credentials: true, 
//   },
// });

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Join a specific room
//   socket.on('joinRoom', ({ userId, recipientId }) => {
//     const room = [userId, recipientId].sort().join('-');
//     socket.join(room);
//     console.log(`User ${userId} joined room: ${room}`);
//   });

//   // Handle sending messages (including text and file messages)
//   socket.on('sendMessage', async (message) => {
//     const { senderId, recipientId, message: text, messageType, fileUrl } = message;

//     const room = [senderId, recipientId].sort().join('-');
//     console.log(`Sending message to room ${room}:`, message);

//     try {
//       // Save the message to the database if needed
//       // const save = await chatRepo.sendMessage(message); // Uncomment this if you want to save the message

//       // Emit the message to the room
//       io.to(room).emit('receiveMessage', message);

//       // Real-time update for images/files
//       if (messageType !== 'text' && fileUrl) {
//         // Emit the file message to the room
//         io.to(room).emit('receiveMessage', {
//           senderId,
//           recipientId,
//           message: text,
//           messageType,
//           fileUrl,
//         });
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   });

//   // Handle user disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });
