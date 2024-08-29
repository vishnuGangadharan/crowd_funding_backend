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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
class UserController {
    constructor(userUseCase) {
        this.userUseCase = userUseCase;
    }
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("req.body", req.body);
                const verifyUser = yield this.userUseCase.checkAlreadyExist(req.body.email);
                if (verifyUser.data.status === true && req.body.isGoogle) {
                    const user = yield this.userUseCase.verifyOtpUser(req.body);
                    return res.status(user.status).json(user.data);
                }
                if (verifyUser.data.status === true) {
                    const sendOTP = yield this.userUseCase.signup(req.body.email, req.body.name, req.body.phone, req.body.password, req.body.isGoogle);
                    return res.status(sendOTP.status).json(sendOTP.data);
                }
                else {
                    return res.status(verifyUser.status).json(verifyUser.data);
                }
            }
            catch (error) {
                next(error);
                console.log(error);
            }
        });
    }
    verifyOTP(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp, email } = req.body;
                console.log("otp", otp, "email", email);
                let verify = yield this.userUseCase.verifyOtp(email, otp);
                if (verify.status == 400) {
                    return res.status(verify.status).json({ message: verify.message });
                }
                else if (verify.status == 200) {
                    let save = yield this.userUseCase.verifyOtpUser(verify.data);
                    if (save) {
                        return res.status(save.status).json(save);
                    }
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield this.userUseCase.login(email, password);
                if (user) {
                    return res.status(user.status).cookie('jwt', user.data.token).json(user.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    editProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { name, email, phone } = req.body;
                const user = { name, email, phone };
                const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
                const updateUser = yield this.userUseCase.editProfile(user, filePath);
                if (updateUser) {
                    return res.status(updateUser.status).json(updateUser.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    sendOtpForBeneficiary(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkForExisting = yield this.userUseCase.findBeneficiary(req.body);
                return res.status(checkForExisting.status).json(checkForExisting.data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyOtpBeneficiary(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp, email } = req.body;
                let verify = yield this.userUseCase.verifyOtp(email, otp);
                return res.status(verify.status).json(verify.message);
            }
            catch (error) {
                next(error);
            }
        });
    }
    fileVerification(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = req.files;
                const profilePic = files.profilePics;
                const supportingDocs = files.supportingDocs;
                //mycode
                const beneficiariesJson = JSON.parse(req.body.beneficiaries);
                const { category } = beneficiariesJson, rest = __rest(beneficiariesJson, ["category"]);
                const beneficiaryData = Object.assign(Object.assign(Object.assign({}, rest), { category }), (category === 'education' ? {
                    educationDetails: {
                        instituteName: rest.instituteName,
                        instituteState: rest.instituteState,
                        instituteDistrict: rest.instituteDistrict,
                        institutePostalAddress: rest.institutePostalAddress,
                        institutePin: rest.institutePin,
                    },
                } : {
                    medicalDetails: {
                        hospitalName: rest.hospitalName,
                        hospitalPostalAddress: rest.hospitalPostalAddress,
                        hospitalState: rest.hospitalState,
                        hospitalDistrict: rest.hospitalDistrict,
                        hospitalPin: rest.hospitalPin,
                    },
                }));
                // Remove the top-level fields that are now nested
                if (category === 'education') {
                    delete beneficiaryData.instituteName;
                    delete beneficiaryData.instituteState;
                    delete beneficiaryData.instituteDistrict;
                    delete beneficiaryData.institutePostalAddress;
                    delete beneficiaryData.institutePin;
                }
                else {
                    delete beneficiaryData.hospitalName;
                    delete beneficiaryData.hospitalPostalAddress;
                    delete beneficiaryData.hospitalState;
                    delete beneficiaryData.hospitalDistrict;
                    delete beneficiaryData.hospitalPin;
                }
                console.log("final", beneficiaryData);
                //inside     
                const fundraiserEmail = beneficiaryData.currentUserEmail;
                let supportingDocsPath = supportingDocs.map((val) => val.path);
                const profilePicPath = profilePic.map((val) => val.path);
                const register = yield this.userUseCase.fundRegister(beneficiaryData, fundraiserEmail, supportingDocsPath, profilePicPath);
                if (register) {
                    return res.status(register.status).json(register.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getBeneficiary(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId;
                const allBeneficiaries = yield this.userUseCase.getBeneficiaries(userId);
                if (allBeneficiaries) {
                    return res.status(allBeneficiaries.status).json(allBeneficiaries.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.query.userId;
            const user = yield this.userUseCase.userDetails(userId);
            if (user) {
                return res.status(user === null || user === void 0 ? void 0 : user.status).json(user === null || user === void 0 ? void 0 : user.data);
            }
        });
    }
    getPostDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.query.postId;
            const response = yield this.userUseCase.getPostDetails(userId);
            if (response) {
                return res.status(response === null || response === void 0 ? void 0 : response.status).json(response.data);
            }
        });
    }
    addComment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { comment, postId, userId } = req.body;
            const saveComment = yield this.userUseCase.addComment(comment, postId, userId);
            if (saveComment) {
                return res.status(saveComment.status).json(saveComment.data);
            }
        });
    }
    getComments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.query;
            const comments = yield this.userUseCase.getComments(id);
            if (comments) {
                return res.status(comments.status).json(comments.data);
            }
        });
    }
    getAllPost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, searchTerm, category } = req.query;
            const limit = 3;
            const skip = (Number(page) - 1) * limit;
            console.log('category', category);
            const posts = yield this.userUseCase.allPost(searchTerm, skip, limit, category);
            if (posts) {
                return res.status(posts.status).json(posts.data);
            }
        });
    }
    updatePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { currentPassword, newPassword, confirmPassword } = req.body;
                const data = { currentPassword, newPassword, confirmPassword };
                const changePassword = yield this.userUseCase.updatePassword(data, userId);
                if (changePassword) {
                    res.status(changePassword === null || changePassword === void 0 ? void 0 : changePassword.status).json(changePassword === null || changePassword === void 0 ? void 0 : changePassword.data);
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ error: 'An error occurred while updating the password' });
            }
        });
    }
    reportPost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, postId, reason, comment } = req.body;
                const file = req.file;
                const reportData = {
                    userId,
                    postId,
                    reason,
                    comment,
                    image: file ? file.path : null,
                };
                const report = yield this.userUseCase.reportPost(reportData);
                if (report) {
                    return res.status(report.status).json(report.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    setPayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, anonymousName, userId, beneficiaryId, method } = req.body;
                const paymentData = {
                    amount,
                    anonymousName,
                    userId,
                    beneficiaryId,
                    method
                };
                const response = yield this.userUseCase.setPayment(paymentData);
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    walletPayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, anonymousName, userId, beneficiaryId, method } = req.body;
                const paymentData = {
                    amount,
                    anonymousName,
                    userId,
                    beneficiaryId,
                    method
                };
                const response = yield this.userUseCase.walletPayment(paymentData);
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getDonations(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const beneficiaryId = req.query.beneficiaryId;
                const getDonations = yield this.userUseCase.getDonations(beneficiaryId);
                if (getDonations) {
                    return res.status(getDonations.status).json(getDonations.data);
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    updateBeneficiary(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                console.log("heree", req.body);
                const { content, postId } = req.body;
                const video = (_a = req.files) === null || _a === void 0 ? void 0 : _a.videosUpdate;
                const image = (_b = req.files) === null || _b === void 0 ? void 0 : _b.imagesUpdate;
                let videoPath = [];
                if (video) {
                    videoPath = video.map((file) => file.path);
                    console.log("videoPath", videoPath);
                }
                // Handle image files
                let imagePath = [];
                if (image) {
                    imagePath = image.map((file) => file.path);
                    console.log("imagePath", imagePath);
                }
                const response = yield this.userUseCase.updateBeneficiary(content, videoPath, imagePath, postId);
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStatusUpdates(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = req.query.postID;
                const response = yield this.userUseCase.statusUpdates(postId);
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getWallet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId;
                console.log('userId', userId);
                const response = yield this.userUseCase.getWallet(userId);
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    makeRequestForFund(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                const makeFundRequest = yield this.userUseCase.makeFundRequest(id);
                if (makeFundRequest) {
                    return res.status(makeFundRequest.status).json(makeFundRequest.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = UserController;
