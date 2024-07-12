import express from 'express';
import UserRepository from '../repository/userRepository';
import UserController from '../../adapters/userController/userController';
import UserUseCase from '../../useCase/userUsecase';
import OTPGenerator from '../../infrastructure/services/otpGenerator';
import EncryptPassword from '../services/bcryptPassword';
import SendOtp from '../services/sendEmail';
import jwtService from '../services/generateTocken';
const routes = express.Router();

//services
const otpGenerator = new OTPGenerator();
const encryptPassword = new EncryptPassword();
const sendOtp = new SendOtp();
const JwtService = new jwtService();

//repositories
const userRepository = new UserRepository();

//usecase
const useCase = new UserUseCase(userRepository, otpGenerator, encryptPassword, sendOtp, JwtService);

//controllers
const userController = new UserController(useCase)
  
routes.post('/signup',(req,res,next)=>userController.signup(req,res,next));
routes.post('/verify',(req,res,next)=>userController.verifyOTP(req,res,next));
routes.post('/login',(req,res,next)=> userController.login(req,res,next));
routes.post('/edit-profile',(req,res,next)=>userController.editProfile(req,res,next));

export default routes;