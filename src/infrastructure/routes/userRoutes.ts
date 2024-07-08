import express from 'express';
import UserRepository from '../repository/userRepository';
import UserController from '../../adapters/userController/authController';
const routes = express.Router();
import UserUseCase from '../../useCase/userUsecase';
import OTPGenerator from '../../infrastructure/services/otpGenerator';
import EncryptPassword from '../services/bcryptPassword';
import SendOtp from '../services/sendEmail';



//services
const otpGenerator = new OTPGenerator();
const encryptPassword = new EncryptPassword();
const sendOtp = new SendOtp();
//repositories
const userRepository = new UserRepository();

//usecase
const useCase = new UserUseCase(userRepository, otpGenerator, encryptPassword, sendOtp);

//controllers
const userController = new UserController(useCase)

routes.post('/signup',(req,res,next)=>userController.signup(req,res,next));

export default routes;