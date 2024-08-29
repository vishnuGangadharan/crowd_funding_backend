"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes = express_1.default.Router();
const adminController_1 = __importDefault(require("../../adapters/adminController"));
const adminUsecase_1 = __importDefault(require("../../useCase/adminUsecase"));
const adminRepository_1 = __importDefault(require("../repository/adminRepository"));
const adminRepository = new adminRepository_1.default();
const adminUsecase = new adminUsecase_1.default(adminRepository);
const adminController = new adminController_1.default(adminUsecase);
routes.get("/users", (req, res, next) => adminController.getUsers(req, res, next));
routes.post("/block-status/:id", (req, res, next) => adminController.blockStatusUpdate(req, res, next));
routes.get("/campaign-request", (req, res, next) => adminController.getRequest(req, res, next));
routes.post("/post-approval", (req, res, next) => adminController.postApproval(req, res, next));
routes.get('/all-reports', (req, res, next) => adminController.getAllReports(req, res, next));
routes.get('/post-details', (req, res, next) => adminController.getPostDetails(req, res, next));
routes.post('/block-post', (req, res, next) => adminController.blockPost(req, res, next));
routes.get('/fund-request', (req, res, next) => adminController.getFundRequest(req, res, next));
routes.post('/confirm-funding', (req, res, next) => adminController.confirmFunding(req, res, next));
routes.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));
// routes.get('/dashboard-counts', (req,res,next) => adminController.getDashboardCounts(req,res,next))
exports.default = routes;
