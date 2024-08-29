"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class jwtService {
    generateToken(userId, role) {
        const secretKey = process.env.JWT_SECRET_KEY;
        if (secretKey) {
            const token = jsonwebtoken_1.default.sign({ userId, role }, secretKey, { expiresIn: '7d' });
            return token;
        }
        throw new Error("JWT_SECRET_KEY not found");
    }
    generateRefreshToken(userId, role) {
        try {
            const secretKey = process.env.JWT_SECRET_KEY;
            const payload = { userId, role };
            const refreshToken = jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: "6d" });
            return refreshToken;
        }
        catch (error) {
            console.log("refreshtockn error", error);
        }
    }
}
exports.default = jwtService;
