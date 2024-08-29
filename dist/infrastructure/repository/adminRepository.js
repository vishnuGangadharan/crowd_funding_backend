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
const beneficiaryModel_1 = __importDefault(require("../database/beneficiaryModel"));
const donationsModel_1 = __importDefault(require("../database/donationsModel"));
const postReportModel_1 = __importDefault(require("../database/postReportModel"));
const profitSchema_1 = __importDefault(require("../database/profitSchema"));
const userModel_1 = __importDefault(require("../database/userModel"));
const wallet_1 = __importDefault(require("../database/wallet"));
class AdminRepository {
    findAllUsers(page, limit, searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const query = searchTerm ?
                {
                    isAdmin: false, $or: [
                        { name: { $regex: searchTerm, $options: 'i' } },
                        { email: { $regex: searchTerm, $options: 'i' } }
                    ]
                }
                : { isAdmin: false };
            const users = yield userModel_1.default.find(query).skip(skip).limit(limit).lean();
            const total = yield userModel_1.default.countDocuments(query);
            return { users, total };
        });
    }
    findByIdAndUpdate(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findByIdAndUpdate(id, { isBlocked: status }, { new: true });
            return user ? true : false;
        });
    }
    getRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield beneficiaryModel_1.default.find({});
            return request;
        });
    }
    updateStatus(postId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = yield beneficiaryModel_1.default.findByIdAndUpdate(postId, { isApproved: status }, { new: true });
            return update;
        });
    }
    getallReports() {
        return __awaiter(this, void 0, void 0, function* () {
            const allReport = yield postReportModel_1.default.find({}).populate('postId').exec();
            return allReport;
        });
    }
    getPostDetailsById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const postData = yield beneficiaryModel_1.default.findById(userId).populate('fundraiser').exec();
            return postData;
        });
    }
    blockPost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockPost = yield beneficiaryModel_1.default.findByIdAndUpdate(postId, { blocked: true }, { new: true });
            return blockPost;
        });
    }
    refundAllDonations(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const donations = yield donationsModel_1.default.find({ beneficiaryId: postId });
                if (donations && donations.length > 0) {
                    for (const donation of donations) {
                        let wallet = yield wallet_1.default.findOne({ userId: donation.userId });
                        console.log("walllettt", wallet);
                        if (!wallet) {
                            wallet = new wallet_1.default({
                                userId: donation.userId,
                                balance: 0,
                                transactions: []
                            });
                            console.log(`Created new wallet for userId: ${donation.userId}`);
                        }
                        wallet.transactions.push({
                            beneficiary: donation.beneficiaryId,
                            amount: donation.amount,
                            type: 'credit',
                            description: `Refund for blocked beneficiary campaign of `
                        });
                        wallet.balance += donation.amount;
                        const savedWallet = yield (wallet === null || wallet === void 0 ? void 0 : wallet.save());
                        console.log('Wallet saved successfully:', savedWallet);
                    }
                }
                return donations ? true : false;
            }
            catch (error) {
                console.log(error);
                return null;
            }
        });
    }
    deleteDonations(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield donationsModel_1.default.deleteMany({ beneficiaryId: postId });
            yield beneficiaryModel_1.default.findByIdAndUpdate(postId, { contributedAmount: 0 });
        });
    }
    getFundRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getFundRequest = yield beneficiaryModel_1.default.find({
                    $or: [
                        { requestedAmount: true },
                        { targetDateFinished: true },
                    ]
                });
                return getFundRequest;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    confirmFunding(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmFunding = yield beneficiaryModel_1.default.findByIdAndUpdate(id, { fundRequestConfirmed: true }, { new: true });
            return confirmFunding ? true : false;
        });
    }
    getProfit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const contributedAmount = yield beneficiaryModel_1.default.findById(id);
            const amount = (contributedAmount === null || contributedAmount === void 0 ? void 0 : contributedAmount.contributedAmount) || 0;
            const profit = amount * (5 / 100);
            let updateProfit = yield profitSchema_1.default.findOne();
            if (!updateProfit) {
                updateProfit = new profitSchema_1.default({
                    totalProfit: 0,
                    transactions: []
                });
            }
            if (Array.isArray(updateProfit.transactions)) {
                updateProfit.transactions.push({
                    beneficiary: id,
                    amount: amount
                });
            }
            if (updateProfit.totalProfit !== undefined) {
                updateProfit.totalProfit += profit || 0;
            }
            else {
                updateProfit.totalProfit = profit || 0;
            }
            const saved = yield updateProfit.save();
            return false;
        });
    }
    getDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const beneficiaries = yield beneficiaryModel_1.default.find({
                fundRequestConfirmed: { $ne: true },
                isApproved: 'approved',
                blocked: false
            })
                .populate('fundraiser')
                .exec();
            return beneficiaries;
        });
    }
    getDashboardCounts() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const result = yield beneficiaryModel_1.default.aggregate([
                {
                    $facet: {
                        totalPosts: [
                            {
                                $match: {
                                    blocked: { $ne: true },
                                    fundRequestConfirmed: { $ne: true },
                                }
                            },
                            { $count: 'total' }
                        ],
                        postsThisMonth: [
                            {
                                $match: {
                                    blocked: { $ne: true },
                                    fundRequestConfirmed: { $ne: true },
                                    createdAt: { $gte: startOfMonth },
                                }
                            },
                            { $count: 'total' }
                        ],
                        completedPosts: [
                            {
                                $match: {
                                    fundRequestConfirmed: true
                                }
                            },
                            { $count: 'total' }
                        ],
                        allPosts: [
                            {
                                $match: {
                                    fundRequestConfirmed: { $ne: true },
                                    isApproved: 'approved',
                                    blocked: false
                                }
                            }
                        ]
                    }
                }
            ]);
            const totalProfit = yield profitSchema_1.default.findOne({});
            const totalPosts = ((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalPosts[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
            const postsThisMonth = ((_d = (_c = result[0]) === null || _c === void 0 ? void 0 : _c.postsThisMonth[0]) === null || _d === void 0 ? void 0 : _d.total) || 0;
            const completedPosts = ((_f = (_e = result[0]) === null || _e === void 0 ? void 0 : _e.completedPosts[0]) === null || _f === void 0 ? void 0 : _f.total) || 0;
            const allPosts = ((_g = result[0]) === null || _g === void 0 ? void 0 : _g.allPosts) || [];
            let counts = {
                totalPosts,
                postsThisMonth,
                completedPosts,
                totalProfit: totalProfit || undefined,
                beneficiary: allPosts
            };
            console.log('Counts:', totalProfit);
            return counts;
        });
    }
}
exports.default = AdminRepository;
