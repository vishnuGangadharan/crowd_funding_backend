"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRepository_1 = __importDefault(require("../repository/userRepository"));
const userController_1 = __importDefault(require("../../adapters/userController/userController"));
const userUsecase_1 = __importDefault(require("../../useCase/userUsecase"));
const otpGenerator_1 = __importDefault(require("../../infrastructure/services/otpGenerator"));
const bcryptPassword_1 = __importDefault(require("../services/bcryptPassword"));
const sendEmail_1 = __importDefault(require("../services/sendEmail"));
const generateTocken_1 = __importDefault(require("../services/generateTocken"));
const multer_1 = __importDefault(require("../services/multer"));
const routes = express_1.default.Router();
const cloudinary_1 = __importDefault(require("../services/cloudinary"));
const userAuth_1 = require("../middileware/userAuth");
const errorHandle_1 = __importDefault(require("../middileware/errorHandle"));
//services
const otpGenerator = new otpGenerator_1.default();
const encryptPassword = new bcryptPassword_1.default();
const sendOtp = new sendEmail_1.default();
const JwtService = new generateTocken_1.default();
const cloudinary = new cloudinary_1.default();
//repositories
const userRepository = new userRepository_1.default();
//usecase
const useCase = new userUsecase_1.default(userRepository, otpGenerator, encryptPassword, sendOtp, JwtService, cloudinary);
//controllers
const userController = new userController_1.default(useCase);
routes.post('/signup', (req, res, next) => userController.signup(req, res, next));
routes.post('/verify', (req, res, next) => userController.verifyOTP(req, res, next));
routes.post('/login', (req, res, next) => userController.login(req, res, next));
routes.get('/user-details', userAuth_1.userAuth, (req, res, next) => userController.getUser(req, res, next));
routes.post('/edit-profile', multer_1.default.single('profilePicture'), userAuth_1.userAuth, (req, res, next) => userController.editProfile(req, res, next));
routes.post('/media-uploader', multer_1.default.fields([{ name: "profilePics", maxCount: 3 }, { name: "supportingDocs", maxCount: 3 }]), userAuth_1.userAuth, (req, res, next) => {
    userController.fileVerification(req, res, next);
});
routes.get('/getBenificiers', userAuth_1.userAuth, (req, res, next) => userController.getBeneficiary(req, res, next));
routes.post('/beneficiary-verification', userAuth_1.userAuth, (req, res, next) => userController.sendOtpForBeneficiary(req, res, next));
routes.post('/beneficiary-otpverify', userAuth_1.userAuth, (req, res, next) => userController.verifyOtpBeneficiary(req, res, next));
routes.get('/post-details', userAuth_1.userAuth, (req, res, next) => userController.getPostDetails(req, res, next));
routes.post('/add-comment', userAuth_1.userAuth, (req, res, next) => userController.addComment(req, res, next));
routes.get('/get-comments', (req, res, next) => userController.getComments(req, res, next));
routes.get('/all-posts', (req, res, next) => userController.getAllPost(req, res, next));
routes.post('/update-password/:id', userAuth_1.userAuth, (req, res, next) => userController.updatePassword(req, res, next));
routes.post('/report-post', multer_1.default.single("file"), userAuth_1.userAuth, (req, res, next) => userController.reportPost(req, res, next));
//payment
routes.post('/get-session-id', userAuth_1.userAuth, (req, res, next) => userController.setPayment(req, res, next));
routes.get('/get-donations', userAuth_1.userAuth, (req, res, next) => userController.getDonations(req, res, next));
routes.post('/update-beneficiary', multer_1.default.fields([{ name: 'imagesUpdate', maxCount: 2 }, { name: 'videosUpdate', maxCount: 2 }]), userAuth_1.userAuth, (req, res, next) => userController.updateBeneficiary(req, res, next));
routes.get('/status-updates', userAuth_1.userAuth, (req, res, next) => userController.getStatusUpdates(req, res, next));
routes.get('/get-wallet', userAuth_1.userAuth, (req, res, next) => userController.getWallet(req, res, next));
routes.post('/wallet-payment', userAuth_1.userAuth, (req, res, next) => userController.walletPayment(req, res, next));
routes.put('/requesting-fund', userAuth_1.userAuth, (req, res, next) => userController.makeRequestForFund(req, res, next));
routes.use(errorHandle_1.default);
exports.default = routes;
