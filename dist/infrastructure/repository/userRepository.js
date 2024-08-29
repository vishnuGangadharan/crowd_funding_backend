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
const userModel_1 = __importDefault(require("../database/userModel"));
const otpModel_1 = __importDefault(require("../database/otpModel"));
const beneficiaryModel_1 = __importDefault(require("../database/beneficiaryModel"));
const commentModel_1 = __importDefault(require("../database/commentModel"));
const postReportModel_1 = __importDefault(require("../database/postReportModel"));
const donationsModel_1 = __importDefault(require("../database/donationsModel"));
const beneficiaryUpdateModel_1 = __importDefault(require("../database/beneficiaryUpdateModel"));
const wallet_1 = __importDefault(require("../database/wallet"));
class UserRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = yield userModel_1.default.findOne({ email });
            return userData;
        });
    }
    saveOTP(otp, email, name, phone, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpDoc = new otpModel_1.default({
                email,
                name,
                phone,
                password,
                otp,
                otpGeneratedAt: new Date(),
                otpExpiredAt: new Date(Date.now() + 1000 * 60 * 60)
            });
            const saveDoc = yield otpDoc.save();
            return saveDoc;
        });
    }
    findOtpByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpData = yield otpModel_1.default.findOne({ email }).sort({ otpGeneratedAt: -1 });
            return otpData;
        });
    }
    deleteOtpByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return otpModel_1.default.deleteOne({ email });
        });
    }
    save(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new userModel_1.default(user);
            const savedUser = yield newUser.save();
            return savedUser;
        });
    }
    verifyBeneficiary(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existBeneficiary = yield beneficiaryModel_1.default.findOne({ email });
            return existBeneficiary;
        });
    }
    createFundraiser(beneficiary, fundraiser) {
        return __awaiter(this, void 0, void 0, function* () {
            const newBeneficiary = new beneficiaryModel_1.default(Object.assign(Object.assign({}, beneficiary), { fundraiser: fundraiser, medicalDetails: {} }));
            const savedBeneficiary = yield newBeneficiary.save();
            return savedBeneficiary.toObject();
        });
    }
    updateFundraiser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateAsFundraiser = yield userModel_1.default.findByIdAndUpdate(userId, { $set: { isFundraiser: true } }, { new: true });
            return !!updateAsFundraiser;
        });
    }
    getBeneficiaries(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const beneficiaries = yield beneficiaryModel_1.default.find({ fundraiser: userId });
            return beneficiaries;
        });
    }
    editProfile(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateUser = yield userModel_1.default.updateOne({ email: user.email }, { $set: { name: user.name, phone: user.phone, email: user.email, profilePicture: user.profilePicture } });
            return updateUser.modifiedCount > 0;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = yield userModel_1.default.findById(id).exec();
            return userData;
        });
    }
    getPostDetailsById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const postData = yield beneficiaryModel_1.default.findById(userId).populate('fundraiser').exec();
            return postData;
        });
    }
    createComment(comment, userId, postId, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const newComment = new commentModel_1.default({
                comment,
                userId,
                postId,
                userName,
            });
            const savedComment = yield newComment.save();
            return savedComment.toObject();
        });
    }
    getComments(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield commentModel_1.default.find({ postId: id }).lean().sort({ createdAt: -1 }).exec();
            return comments;
        });
    }
    getAllPost(searchTerm, skip, limit, category) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                isApproved: "approved",
                blocked: false,
                fundRequestConfirmed: false,
            };
            if (category) {
                query.category = category;
            }
            if (searchTerm) {
                query.$or = [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { heading: { $regex: searchTerm, $options: 'i' } },
                    { category: { $regex: searchTerm, $options: 'i' } }
                ];
            }
            const posts = yield beneficiaryModel_1.default.find(query)
                .populate('fundraiser')
                .skip(skip)
                .limit(limit)
                .exec();
            const totalCount = yield beneficiaryModel_1.default.countDocuments(query);
            const totalPages = Math.ceil(totalCount / limit);
            return { data: posts, totalPages: totalPages };
        });
    }
    updatePassword(password, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = yield userModel_1.default.findByIdAndUpdate({ _id: userId }, { $set: { password: password } }, { new: true });
            return update;
        });
    }
    findPostById(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const postExists = yield beneficiaryModel_1.default.findById(postId);
            return postExists;
        });
    }
    createReport(reportData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("report", reportData);
            const newReport = new postReportModel_1.default(reportData);
            const saveReport = yield newReport.save();
            return saveReport;
        });
    }
    saveDonation(donationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newDonation = new donationsModel_1.default(donationData);
            const saveDonation = yield newDonation.save();
            return saveDonation;
        });
    }
    amountReached(amount, beneficiaryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reachedTarget = yield beneficiaryModel_1.default.findById(beneficiaryId);
                if (reachedTarget && reachedTarget.amount !== undefined) {
                    const data = {
                        targetAmount: reachedTarget.amount || 0,
                        amountRaised: reachedTarget.contributedAmount || 0
                    };
                    console.log('dddddd', data);
                    return data;
                }
                return {
                    targetAmount: 0,
                    amountRaised: 0
                };
            }
            catch (error) {
                console.error('Error fetching beneficiary amounts:', error);
                throw error;
            }
        });
    }
    checkWallet(amount, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield wallet_1.default.findOne({ userId });
            console.log("dddddddd", wallet);
            return wallet && wallet.balance >= amount;
        });
    }
    getDonations(beneficiaryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const donations = yield donationsModel_1.default.find({ beneficiaryId: beneficiaryId }).populate('userId').exec();
            return donations;
        });
    }
    updateContribution(amount, beneficiaryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const numericAmount = Number(amount);
                if (isNaN(numericAmount)) {
                    throw new Error('Invalid amount value');
                }
                const updateAmount = yield beneficiaryModel_1.default.updateOne({ _id: beneficiaryId }, { $inc: { contributedAmount: numericAmount } });
                return updateAmount.modifiedCount > 0;
            }
            catch (error) {
                console.error('Error updating contribution:', error);
                return false;
            }
        });
    }
    findReport(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existUserReport = yield postReportModel_1.default.findOne({ userId });
            return existUserReport;
        });
    }
    getCountReport(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield postReportModel_1.default.countDocuments({ postId });
            return count;
        });
    }
    updateBeneficiary(content, video, image, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const savedUpdate = new beneficiaryUpdateModel_1.default({
                    postId: postId,
                    content: content,
                    video: video,
                    image: image,
                });
                const update = yield savedUpdate.save();
                return update ? true : false;
            }
            catch (error) {
                console.error('Error updating beneficiary:', error);
                return false;
            }
        });
    }
    getStatusUpdates(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const statusUpdates = yield beneficiaryUpdateModel_1.default.find({ postId: postId });
            return statusUpdates;
        });
    }
    getWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield wallet_1.default.find({ userId: userId })
                .populate('userId')
                .populate({
                path: 'transactions.beneficiary',
                model: 'beneficiary'
            }).exec();
            return wallet;
        });
    }
    makeFundRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const update = yield beneficiaryModel_1.default.findByIdAndUpdate(id, { requestedAmount: true }, { new: true });
                return update ? true : false;
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
}
exports.default = UserRepository;
