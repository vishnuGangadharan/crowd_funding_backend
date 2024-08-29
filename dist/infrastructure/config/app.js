"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import session from 'express-session'
const http_1 = __importDefault(require("http"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("../routes/adminRoutes"));
const chatRoutes_1 = __importDefault(require("../routes/chatRoutes"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
exports.httpServer = http_1.default.createServer(app);
const chatRepository_1 = __importDefault(require("../repository/chatRepository"));
const chatModel_1 = __importDefault(require("../database/chatModel"));
const chatRepo = new chatRepository_1.default();
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use('/api/user', userRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
const io = new socket_io_1.Server(exports.httpServer, {
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
    socket.on('sendMessage', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const { senderId, recipientId, message: text } = message;
        const room = [senderId, recipientId].sort().join('-');
        try {
            io.to(room).emit('receiveMessage', message);
            const unreadCount = yield chatModel_1.default.countDocuments({ recipientId, senderId, read: false });
            io.to(room).emit('updateUnreadCount', { senderId, unreadCount });
        }
        catch (error) {
            console.error('Error sending message:', error);
        }
    }));
    socket.on('markMessagesAsRead', (_a) => __awaiter(void 0, [_a], void 0, function* ({ recipientId, senderId }) {
        try {
            console.log('Received markMessagesAsRead event with recipientId:', recipientId);
            console.log("herrr");
            // Update all unread messages from senderId to recipientId to read:true
            yield chatModel_1.default.updateMany({ recipientId, senderId, read: false }, { $set: { read: true } });
            // Notify the client that the unread count is now 0
            const room = [senderId, recipientId].sort().join('-');
            io.to(room).emit('updateUnreadCount', { senderId, unreadCount: 0 });
        }
        catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }));
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
