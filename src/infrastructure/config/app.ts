import express from 'express'
import cookieParser from 'cookie-parser'
// import session from 'express-session'
import http from 'http'
import userRoutes from '../routes/userRoutes'
import adminRoutes from '../routes/adminRoutes'
import cors from 'cors'
import morg from 'morgan'
import { Server as SocketIOServer } from 'socket.io';
const app = express()
export const httpServer  = http.createServer(app) 

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


//new part

const io = new SocketIOServer(httpServer, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`${socket.id} joined room: ${room}`);
    });
  
    socket.on('message', ({ room, message }) => {
      console.log({ room, message });
      io.to(room).emit('receive-message', message);
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
  