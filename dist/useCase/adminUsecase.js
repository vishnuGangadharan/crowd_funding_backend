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
Object.defineProperty(exports, "__esModule", { value: true });
class AdminUsecase {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    getUsers(page, limit, searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.adminRepository.findAllUsers(page, limit, searchTerm);
                if (users) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            data: users.users,
                            total: users.total,
                            page,
                            limit,
                            message: "Users retrieved successfully"
                        }
                    };
                }
                else {
                    return {
                        status: 404,
                        data: {
                            status: false,
                            data: null,
                            message: "No users found"
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    handleBlockStatus(userId, statuss) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.adminRepository.findByIdAndUpdate(userId, statuss);
                if (user) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            data: user,
                            message: "User blocked successfully"
                        }
                    };
                }
                else {
                    return {
                        status: 404,
                        data: {
                            status: false,
                            data: null,
                            message: "User not found"
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    getRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.adminRepository.getRequest();
                if (request) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            data: request,
                            message: "Request retrieved successfully"
                        }
                    };
                }
                else {
                    return {
                        status: 404,
                        data: {
                            status: false,
                            data: null,
                            message: "No request found"
                        }
                    };
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    approvalPost(postId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateStatus = yield this.adminRepository.updateStatus(postId, status);
            console.log("upa", updateStatus);
            if (updateStatus) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: "Updated success fully",
                    }
                };
            }
        });
    }
    allReports() {
        return __awaiter(this, void 0, void 0, function* () {
            const allReport = yield this.adminRepository.getallReports();
            if (allReport) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: allReport
                    }
                };
            }
        });
    }
    getPostDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const postDetails = yield this.adminRepository.getPostDetailsById(userId);
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
    blockPost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockPost = yield this.adminRepository.blockPost(postId);
            console.log("block");
            blockPost;
            const donations = yield this.adminRepository.refundAllDonations(postId);
            if (donations) {
                const deleteDonations = yield this.adminRepository.deleteDonations(postId);
            }
            // const splitContributionToDonators = 
            if (blockPost) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: "Post blocked successfully"
                    }
                };
            }
        });
    }
    getFundRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.adminRepository.getFundRequest();
            if (response) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: response,
                    }
                };
            }
        });
    }
    confirmFunding(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmFunding = yield this.adminRepository.confirmFunding(id);
            if (confirmFunding) {
                const getProfit = yield this.adminRepository.getProfit(id);
            }
        });
    }
    getDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const getDashboard = yield this.adminRepository.getDashboard();
            if (getDashboard) {
                return {
                    status: 200,
                    data: {
                        status: 'true',
                        data: getDashboard
                    }
                };
            }
        });
    }
    getDashboardCounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const getDashboardCounts = yield this.adminRepository.getDashboardCounts();
            if (getDashboardCounts) {
                return {
                    status: 200,
                    data: {
                        status: 'true',
                        data: getDashboardCounts
                    }
                };
            }
        });
    }
}
exports.default = AdminUsecase;
