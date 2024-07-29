import express from 'express';
import UserRepository from '../repository/userRepository';
import UserController from '../../adapters/userController/userController';
import UserUseCase from '../../useCase/userUsecase';
import OTPGenerator from '../../infrastructure/services/otpGenerator';
import EncryptPassword from '../services/bcryptPassword';
import SendOtp from '../services/sendEmail';
import jwtService from '../services/generateTocken';
import upload from '../services/multer';
const routes = express.Router();
import  { Request, Response, NextFunction } from 'express';
import Cloudinary from '../services/cloudinary';
//services
const otpGenerator = new OTPGenerator();
const encryptPassword = new EncryptPassword();
const sendOtp = new SendOtp();
const JwtService = new jwtService();
const cloudinary = new Cloudinary();
//repositories
const userRepository = new UserRepository();

//usecase
const useCase = new UserUseCase(userRepository, otpGenerator, encryptPassword, sendOtp, JwtService, cloudinary);

//controllers
const userController = new UserController(useCase)
  
routes.post('/signup',(req,res,next)=>userController.signup(req,res,next));
routes.post('/verify',(req,res,next)=>userController.verifyOTP(req,res,next));
routes.post('/login',(req,res,next)=> userController.login(req,res,next));
routes.post('/edit-profile', upload.single('profilePicture'), (req, res, next) => userController.editProfile(req, res, next));
routes.post('/media-uploader', upload.fields([{ name: "profilePics", maxCount:3}, { name: "supportingDocs", maxCount: 3}]),(req,res, next)=>{
        userController.fileVerification(req,res,next)
        })
routes.get('/getBenificiers',(req,res,next)=>userController.getBeneficiary(req,res,next));
routes.get('/user-details',(req,res,next)=>userController.getUser(req,res,next));
routes.post('/beneficiary-verification',(req,res,next)=> userController.sendOtpForBeneficiary(req,res,next))
routes.post('/beneficiary-otpverify',(req,res,next)=> userController.verifyOtpBeneficiary(req,res,next))
routes.get('/post-details', (req,res,next)=> userController.getPostDetails(req,res,next))
routes.post('/add-comment', (req,res, next)=> userController.addComment(req,res,next))


export default routes;