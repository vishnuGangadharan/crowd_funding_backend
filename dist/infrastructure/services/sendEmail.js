"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class SendOtp {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'cozastore4@gmail.com',
                pass: process.env.PASS
            }
        });
    }
    sendEmail(email, otp) {
        console.log('otpLLL', otp);
        console.log('emailLLL', email);
        const mailOPtions = {
            from: process.env.USER,
            to: email,
            subject: "fundraising user signup verification",
            text: `${email}, your verification code is: ${otp}`
        };
        this.transporter.sendMail(mailOPtions, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('verification code sent successfully');
            }
        });
    }
    fundraiserConfirmMail(email, otp) {
        console.log('otpLLL', otp);
        const mailOPtions = {
            from: process.env.USER,
            to: email,
            subject: "otp for you fundraising verification",
            text: `${email}, your verification code is: ${otp}`
        };
        this.transporter.sendMail(mailOPtions, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('verification code sent successfully');
            }
        });
    }
}
exports.default = SendOtp;
