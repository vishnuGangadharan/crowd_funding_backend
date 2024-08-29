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
exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../database/userModel"));
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ message: "Authorization header missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decodeToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
        if (decodeToken.role !== "user") {
            return res.status(400).json({ message: "Unauthorized access" });
        }
        const userId = decodeToken.userId;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.isBlocked) {
            return res.status(403).json({ message: "User is blocked", accountType: "user" });
        }
        next();
    }
    catch (error) {
        console.error("Error decoding token:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
});
exports.userAuth = userAuth;
