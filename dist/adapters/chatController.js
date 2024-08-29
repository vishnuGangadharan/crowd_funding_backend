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
Object.defineProperty(exports, "__esModule", { value: true });
class ChatController {
    constructor(chatUseCase) {
        this.chatUseCase = chatUseCase;
    }
    sendMessage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('kittiyi');
                console.log("llllllll", req.body);
                console.log('222222222222222222222', req.file);
                const file = req.file;
                let path;
                if (file) {
                    path = file.path;
                }
                const { senderId, recipientId, message, fileType } = req.body;
                console.log("seder", senderId, " receiver", recipientId, "message", message);
                const response = yield this.chatUseCase.sendMessage(senderId, recipientId, message, fileType, path || '');
                if (response)
                    res.status(200).json(response);
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    getMessage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("chat get  controller", req.query.senderId, req.query.receiverId);
                const senderId = req.query.senderId;
                const receiverId = req.query.receiverId;
                const getMessage = yield this.chatUseCase.getMessage(senderId, receiverId);
                if (getMessage)
                    return res.status(getMessage === null || getMessage === void 0 ? void 0 : getMessage.status).json(getMessage === null || getMessage === void 0 ? void 0 : getMessage.data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    chattedUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let senderId = req.query.userID;
                const response = yield this.chatUseCase.chattedUsers(senderId);
                console.log("response", response);
                if (response)
                    res.status(response.status).json(response.data);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ChatController;
