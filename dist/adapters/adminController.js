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
class AdminController {
    constructor(adminUseCase) {
        this.adminUseCase = adminUseCase;
    }
    getUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const searchTerm = req.query.searchTerm || '';
                const users = yield this.adminUseCase.getUsers(page, limit, searchTerm);
                if (users) {
                    return res.status(users === null || users === void 0 ? void 0 : users.status).json(users);
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    blockStatusUpdate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { status } = req.body;
                const response = yield this.adminUseCase.handleBlockStatus(userId, status);
                if (response && response.status) {
                    return res.status(response.status).json(response);
                }
                else {
                    return res.status(500).json({ error: 'Invalid response' });
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    getRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.adminUseCase.getRequest();
                if (request) {
                    return res.status(request.status).json(request);
                }
                else {
                    return res.status(500).json({ error: 'Invalid response' });
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    postApproval(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId, status } = req.body;
                console.log(req.body);
                const response = yield this.adminUseCase.approvalPost(postId, status);
                console.log("ddd", response);
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    getAllReports(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("getall post");
                const allReports = yield this.adminUseCase.allReports();
                if (allReports && allReports.status) {
                    return res.status(allReports.status).json(allReports.data);
                }
                else {
                    return res.status(500).json({ error: 'Invalid response' });
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    getPostDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.query.postId;
            const response = yield this.adminUseCase.getPostDetails(userId);
            if (response) {
                return res.status(response === null || response === void 0 ? void 0 : response.status).json(response.data);
            }
        });
    }
    blockPost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("gggg");
                const { postId } = req.body;
                console.log("postId", postId);
                const response = yield this.adminUseCase.blockPost(postId);
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getFundRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.adminUseCase.getFundRequest();
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    confirmFunding(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                console.log('id', id);
                const response = yield this.adminUseCase.confirmFunding(id);
                // if(response){
                //     return res.status(response.status).json(response.data)
                // }
            }
            catch (error) {
                next(error);
            }
        });
    }
    // async getDashboard(req: Request, res: Response, next: NextFunction) {
    //     try {
    //        const response = await this.adminUseCase.getDashboard()
    //         if(response){
    //             return res.status(response.status).json(response.data)
    //         }
    //     }catch(error){
    //         next(error);
    //     }
    // }
    getDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.adminUseCase.getDashboardCounts();
                if (response) {
                    return res.status(response.status).json(response.data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AdminController;
