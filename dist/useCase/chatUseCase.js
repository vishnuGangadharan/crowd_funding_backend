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
const chatRepository_1 = __importDefault(require("../infrastructure/repository/chatRepository"));
class ChatUseCase {
    constructor(chatRepository, cloudinary) {
        this.chatRepository = new chatRepository_1.default();
        this.cloudinary = cloudinary;
    }
    sendMessage(senderId, recipientId, message, fileType, path) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('chat use case', senderId, recipientId, message);
            let cloudinary;
            if (path && fileType) {
                if (fileType === 'image') {
                    cloudinary = yield this.cloudinary.uploadImage(path, 'message');
                }
                else if (fileType === 'video') {
                    cloudinary = yield this.cloudinary.uploadSingleVideo(path, 'message');
                }
                else if (fileType === 'audio') {
                    cloudinary = yield this.cloudinary.uploadAudio(path, 'message');
                }
            }
            const data = Object.assign({ senderId,
                recipientId, message: message }, (cloudinary && { mediaUrl: cloudinary, messageType: fileType }));
            const response = yield this.chatRepository.sendMessage(data);
            if (response) {
                return response;
            }
            return null;
        });
    }
    getMessage(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getMessage = yield this.chatRepository.getMessages(senderId, receiverId);
                if (getMessage) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            data: getMessage
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    chattedUsers(senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chattedUsers = yield this.chatRepository.chattedUsers(senderId);
                if (chattedUsers) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            data: chattedUsers
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.default = ChatUseCase;
