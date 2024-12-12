import express from "express";
const routes = express.Router();
import AdminController from "../../adapters/adminController";
import AdminUsecase from "../../useCase/adminUsecase";
import AdminRepository from "../repository/adminRepository";



const adminRepository = new AdminRepository()
const adminUsecase = new AdminUsecase(adminRepository)

const adminController = new AdminController(adminUsecase)

routes.get("/users",(req,res,next)=>adminController.getUsers(req,res,next))
routes.post("/block-status/:id",(req,res,next)=>adminController.blockStatusUpdate(req,res,next))
routes.get("/campaign-request",(req,res,next)=>adminController.getRequest(req,res,next))
routes.post("/post-approval", (req,res,next) => adminController.postApproval(req, res, next))
routes.get('/all-reports', (req,res,next) => adminController.getAllReports(req,res,next))
routes.get('/post-details', (req,res,next)=> adminController.getPostDetails(req,res,next));
routes.post('/block-post', (req,res,next) => adminController.blockPost(req,res,next))
routes.get('/fund-request', (req,res,next) => adminController.getFundRequest(req,res,next))
routes.post('/confirm-funding', (req,res,next) => adminController.confirmFunding(req,res,next))
routes.get('/dashboard', (req,res,next) => adminController.getDashboard(req,res,next))
export default routes