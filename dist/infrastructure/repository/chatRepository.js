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
const chatModel_1 = __importDefault(require("../database/chatModel"));
class ChatRepository {
    // sendMessage(data: chatTypes){
    //     const newMessage = new messageModel(data)
    //     const saveMessage = newMessage.save();
    //     console.log('saved');
    // }
    sendMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new chatModel_1.default(data);
            yield newMessage.save();
            console.log('saved');
            return "saved";
        });
    }
    getMessages(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield chatModel_1.default.find({
                $or: [
                    { senderId: senderId, recipientId: receiverId },
                    { senderId: receiverId, recipientId: senderId }
                ]
            }).sort({ createdAt: 1 });
            return messages;
        });
    }
    chattedUsers(senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chats = yield chatModel_1.default.find({
                    $or: [
                        { senderId: senderId },
                        { recipientId: senderId },
                    ],
                })
                    .populate('senderId', 'name profilePicture')
                    .populate('recipientId', 'name profilePicture')
                    .sort({ createdAt: -1 });
                const users = new Map();
                chats.forEach(chat => {
                    const sender = chat.senderId;
                    const recipient = chat.recipientId;
                    if (sender && sender._id !== senderId) {
                        users.set(sender._id.toString(), { _id: sender._id.toString(), name: sender.name, profilePicture: sender.profilePicture });
                    }
                    if (recipient && recipient._id !== senderId) {
                        users.set(recipient._id.toString(), { _id: recipient._id.toString(), name: recipient.name, profilePicture: recipient.profilePicture });
                    }
                });
                // Convert the Map to an array to return the list of unique users
                return Array.from(users.values());
            }
            catch (error) {
                console.log(error);
                return null;
            }
        });
    }
}
exports.default = ChatRepository;
