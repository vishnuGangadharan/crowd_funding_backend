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
import { userAuth } from '../middileware/userAuth';
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
routes.get('/user-details',userAuth,(req,res,next)=>userController.getUser(req,res,next));
routes.post('/edit-profile', upload.single('profilePicture'), userAuth,(req, res, next) => userController.editProfile(req, res, next));
routes.post('/media-uploader', upload.fields([{ name: "profilePics", maxCount:3}, { name: "supportingDocs", maxCount: 3}]),userAuth,(req,res, next)=>{
        userController.fileVerification(req,res,next)
        })
routes.get('/getBenificiers',userAuth,(req,res,next)=>userController.getBeneficiary(req,res,next));
routes.post('/beneficiary-verification',userAuth,(req,res,next)=> userController.sendOtpForBeneficiary(req,res,next));
routes.post('/beneficiary-otpverify',userAuth,(req,res,next)=> userController.verifyOtpBeneficiary(req,res,next));
routes.get('/post-details',userAuth, (req,res,next)=> userController.getPostDetails(req,res,next));
routes.post('/add-comment',userAuth, (req,res, next)=> userController.addComment(req,res,next));
routes.get('/get-comments', (req,res, next) => userController.getComments(req,res,next));
routes.get('/all-posts', (req, res, next) => userController.getAllPost(req,res, next));
routes.post('/update-password/:id',userAuth,(req, res, next) => userController.updatePassword(req, res, next))
routes.post('/report-post' , upload.single("file") , userAuth, (req, res, next) => userController.reportPost(req, res, next))
//payment
routes.post('/get-session-id',userAuth, (req, res, next) => userController.setPayment(req, res, next))
routes.get('/get-donations',userAuth,(req,res,next) => userController.getDonations(req,res,next));


export default routes;