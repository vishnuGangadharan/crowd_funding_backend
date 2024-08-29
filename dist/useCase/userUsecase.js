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
const stripe_1 = __importDefault(require("stripe"));
class UserUseCase {
    constructor(userRepository, OTPGenerator, EncryptPassword, GenerateMail, jwtService, cloudinary) {
        this.userRepository = userRepository;
        this.OTPGenerator = OTPGenerator;
        this.EncryptPassword = EncryptPassword;
        this.GenerateMail = GenerateMail;
        this.jwtService = jwtService;
        this.cloudinary = cloudinary;
    }
    checkAlreadyExist(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userExist = yield this.userRepository.findByEmail(email);
            if (userExist) {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "User already exist"
                    }
                };
            }
            else {
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: "User does not exist"
                    }
                };
            }
        });
    }
    signup(email, name, phone, password, isGoogle) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = this.OTPGenerator.createOTP();
            const hashedPassword = yield this.EncryptPassword.encryptPassword(password);
            yield this.userRepository.saveOTP(otp, email, name, phone, hashedPassword);
            this.GenerateMail.sendEmail(email, otp);
            return {
                status: 200,
                data: {
                    status: true,
                    message: 'verification email send'
                }
            };
        });
    }
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            let findOtp = yield this.userRepository.findOtpByEmail(email);
            if (!findOtp) {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "invalid or expired otp"
                    }
                };
            }
            let data = {
                name: findOtp.name,
                email: findOtp === null || findOtp === void 0 ? void 0 : findOtp.email,
                phone: findOtp.phone,
                password: findOtp.password
            };
            let now = new Date().getTime();
            const otpGeneratedAt = new Date(findOtp.otpGeneratedAt).getTime();
            const otpExpiration = 2 * 60 * 1000; //2mints            
            if (now - otpGeneratedAt > otpExpiration) {
                yield this.userRepository.deleteOtpByEmail(email);
                return {
                    status: 400,
                    message: "otp has expired"
                };
            }
            if (findOtp.otp !== otp) {
                return { status: 400, message: "Invalid OTP" };
            }
            yield this.userRepository.deleteOtpByEmail(email);
            return {
                status: 200,
                message: "OTP verified",
                data: data
            };
        });
    }
    verifyOtpUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            //google auth
            if (user.isGoogle) {
                const hashedPassword = yield this.EncryptPassword.encryptPassword(user.password);
                const newUser = Object.assign(Object.assign({}, user), { password: hashedPassword, isGoogle: true, isVerified: true });
                const userData = yield this.userRepository.save(newUser);
                let data = {
                    _id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    isGoogle: userData.isGoogle
                };
                const token = this.jwtService.generateToken(newUser._id, "user");
                let refreshToken = this.jwtService.generateRefreshToken(newUser._id, "user");
                return {
                    status: 200,
                    data: data,
                    message: "Google Verified Successfully",
                    token: token,
                    refreshToken: refreshToken
                };
            }
            let newUser = Object.assign(Object.assign({}, user), { isVerified: true });
            const userData = yield this.userRepository.save(newUser);
            let data = {
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                isBlocked: userData.isBlocked,
            };
            let token = this.jwtService.generateToken(userData._id, "user");
            let refreshToken = this.jwtService.generateRefreshToken(newUser._id, "user");
            return {
                status: 200,
                data: data,
                message: "OTP Verified Successfully",
                token: token,
                refreshToken: refreshToken
            };
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findByEmail(email);
                let token = "";
                if (user) {
                    let data = {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        isBlocked: user.isBlocked,
                        isAdmin: user.isAdmin,
                    };
                    if (user.isBlocked) {
                        return {
                            status: 400,
                            data: {
                                status: false,
                                message: "User is blocked by the admin",
                                token: ""
                            }
                        };
                    }
                    const passwordMatch = yield this.EncryptPassword.compare(password, user.password);
                    if (passwordMatch && user.isAdmin) {
                        token = this.jwtService.generateToken(user._id, "admin");
                        return {
                            status: 200,
                            data: {
                                status: true,
                                message: data,
                                token,
                                isAdmin: true
                            }
                        };
                    }
                    if (passwordMatch) {
                        token = this.jwtService.generateToken(user._id, "user");
                        return {
                            status: 200,
                            data: {
                                status: true,
                                message: data,
                                token
                            }
                        };
                    }
                    else {
                        return {
                            status: 400,
                            data: {
                                status: false,
                                message: "Invalid password",
                                token: ""
                            }
                        };
                    }
                }
                else {
                    return {
                        status: 400,
                        data: {
                            status: false,
                            message: "Invalid Credentials",
                            token: ""
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    editProfile(data, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, phone } = data;
                if (filePath) {
                    const cloudinary = yield this.cloudinary.uploadImage(filePath, "profilePicture");
                    data.profilePicture = cloudinary;
                }
                const user = yield this.userRepository.findByEmail(data.email);
                if (user) {
                    const updateProfile = yield this.userRepository.editProfile(data);
                    if (updateProfile) {
                        return {
                            status: 200,
                            data: {
                                status: true,
                                message: "user updated successfully"
                            }
                        };
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    findBeneficiary(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, name, phone } = data;
            const exists = yield this.userRepository.verifyBeneficiary(email);
            if (exists) {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "Beneficiary already exists"
                    }
                };
            }
            else {
                const otp = this.OTPGenerator.createOTP();
                yield this.userRepository.saveOTP(otp, email, name, phone);
                this.GenerateMail.sendEmail(email, otp);
                return {
                    status: 200,
                    data: {
                        data: email,
                        status: true,
                        message: 'verification email send'
                    }
                };
            }
        });
    }
    fundRegister(data, fundraiserEmail, supportingDocs, profilePic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUserId = yield this.userRepository.findByEmail(fundraiserEmail);
                const beneficiaryEmail = data.email;
                if (beneficiaryEmail) {
                    const verifyBeneficiary = yield this.userRepository.verifyBeneficiary(beneficiaryEmail);
                    if (verifyBeneficiary) {
                        return {
                            status: 400,
                            data: {
                                status: false,
                                message: "Beneficiary already exists"
                            }
                        };
                    }
                }
                if (supportingDocs && profilePic) {
                    const cloudinary = yield this.cloudinary.uploadMultipleimages(profilePic, "profilePicture");
                    data.profilePic = cloudinary;
                    const multiPics = yield this.cloudinary.uploadMultipleimages(supportingDocs, "supportingDocs");
                    data.supportingDocs = multiPics;
                    if (currentUserId && beneficiaryEmail) {
                        const saveBeneficiary = yield this.userRepository.createFundraiser(data, currentUserId._id);
                        const updateUserAsFundraiser = this.userRepository.updateFundraiser(currentUserId._id);
                        if (saveBeneficiary) {
                            return {
                                status: 200,
                                data: {
                                    status: true,
                                    message: "Beneficiary Registered Successfully"
                                }
                            };
                        }
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    getBeneficiaries(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const beneficiaries = yield this.userRepository.getBeneficiaries(userId);
                if (beneficiaries) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            message: "Beneficiaries fetched successfully",
                            data: beneficiaries
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    userDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findById(userId);
            if (user) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: user
                    }
                };
            }
        });
    }
    getPostDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const postDetails = yield this.userRepository.getPostDetailsById(userId);
            if (postDetails) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: postDetails
                    }
                };
            }
        });
    }
    addComment(comment, postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findById(userId);
            const userName = user === null || user === void 0 ? void 0 : user.name;
            const saveComment = yield this.userRepository.createComment(comment, userId, postId, userName);
            if (saveComment) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: "Comment Added Successfully"
                    }
                };
            }
        });
    }
    getComments(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const allComments = yield this.userRepository.getComments(id);
            if (allComments) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: allComments
                    }
                };
            }
        });
    }
    allPost(searchTerm, skip, limit, category) {
        return __awaiter(this, void 0, void 0, function* () {
            const posts = yield this.userRepository.getAllPost(searchTerm, skip, limit, category);
            if (posts) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: posts,
                    }
                };
            }
        });
    }
    updatePassword(data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findById(userId);
                if (user && data.newPassword) {
                    const match = yield this.EncryptPassword.compare(data.currentPassword, user.password);
                    if (match) {
                        const hashedPassword = yield this.EncryptPassword.encryptPassword(data.newPassword);
                        const updateUser = yield this.userRepository.updatePassword(hashedPassword, userId);
                        if (updateUser) {
                            return {
                                status: 200,
                                data: {
                                    status: true,
                                    message: "updated successfully"
                                }
                            };
                        }
                    }
                    else {
                        return {
                            status: 400,
                            data: {
                                status: false,
                                message: "current password not match"
                            }
                        };
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    reportPost(reportData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reportData.image) {
                const cloudinary = yield this.cloudinary.uploadImage(reportData.image, "reportImage");
                reportData.image = cloudinary;
            }
            const post = yield this.userRepository.findPostById(reportData.postId);
            const allReadyReported = yield this.userRepository.findReport(reportData.userId);
            if (allReadyReported) {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "Your report has been already submitted"
                    }
                };
            }
            const count = yield this.userRepository.getCountReport(reportData.postId);
            console.log("count", count);
            reportData.count = (count !== null && count !== void 0 ? count : 0) + 1;
            if (post && !allReadyReported) {
                const saveReport = yield this.userRepository.createReport(reportData);
                if (saveReport) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            message: "Reported Successfully"
                        }
                    };
                }
            }
            return {
                status: 401,
                data: {
                    status: false,
                    message: "Post not found or report not saved"
                }
            };
        });
    }
    setPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let amount = data.amount;
            const stripeKey = process.env.STRIPE_KEY;
            if (!stripeKey) {
                throw new Error('Stripe key is not defined');
            }
            const stripe = new stripe_1.default(stripeKey);
            const session = yield stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: "Donation amount",
                            },
                            unit_amount: data.amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `http://localhost:3000/postdetails/${data.beneficiaryId}`,
                cancel_url: `http://localhost:3000/postdetails/${data.beneficiaryId}`,
                // customer_email: email,
                billing_address_collection: "auto"
            });
            const amountCheck = yield this.userRepository.amountReached(data.amount, data.beneficiaryId);
            let total = (amountCheck === null || amountCheck === void 0 ? void 0 : amountCheck.amountRaised) + data.amount;
            if (total >= amountCheck.targetAmount) {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "Amount is greater than target amount"
                    }
                };
            }
            const saveDonation = yield this.userRepository.saveDonation(data);
            const updateContribution = yield this.userRepository.updateContribution(data.amount, data.beneficiaryId);
            console.log("saved");
            if (session) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: session.id
                    }
                };
            }
        });
    }
    walletPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkWallet = yield this.userRepository.checkWallet(data.amount, data.userId);
            if (!checkWallet) {
                console.log('noooo');
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "Insufficient balance"
                    }
                };
            }
            const amountCheck = yield this.userRepository.amountReached(data.amount, data.beneficiaryId);
            let total = (amountCheck === null || amountCheck === void 0 ? void 0 : amountCheck.amountRaised) + data.amount;
            if (total >= amountCheck.targetAmount) {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "Amount is greater than target amount"
                    }
                };
            }
            const saveDonation = yield this.userRepository.saveDonation(data);
            const updateContribution = yield this.userRepository.updateContribution(data.amount, data.beneficiaryId);
            console.log("saved");
            return {
                status: 200,
                data: {
                    status: true,
                    message: "Payment Successfully"
                }
            };
        });
    }
    getDonations(beneficiaryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const donations = yield this.userRepository.getDonations(beneficiaryId);
                if (donations) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            data: donations
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    updateBeneficiary(content, video, image, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (image) {
                    console.log("inside image", image);
                    const cloudinary = yield this.cloudinary.uploadMultipleimages(image, "updates");
                    image = cloudinary;
                }
                if (video) {
                    console.log("inside video", video);
                    const cloudinary = yield this.cloudinary.uploadVideo(video, "updates");
                    video = cloudinary;
                }
                const updateBeneficiary = yield this.userRepository.updateBeneficiary(content, video, image, postId);
                if (updateBeneficiary) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            message: "updated successfully"
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    statusUpdates(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statusUpdates = yield this.userRepository.getStatusUpdates(postId);
                if (statusUpdates) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            data: statusUpdates
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    getWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getWallet = yield this.userRepository.getWallet(userId);
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: getWallet
                    }
                };
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    makeFundRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const makeFundRequest = yield this.userRepository.makeFundRequest(id);
                if (makeFundRequest) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            message: "Request sent successfully"
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
exports.default = UserUseCase;
