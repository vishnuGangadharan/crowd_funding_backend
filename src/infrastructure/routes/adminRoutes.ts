import express from "express";
const routes = express.Router();
import AdmiController from "../../adapters/adminController/adminController";
import AdminUsecase from "../../useCase/adminUsecase";
import AdminRepository from "../repository/adminRepository";



const adminRepository = new AdminRepository()
const adminUsecase = new AdminUsecase(adminRepository)

const adminController = new AdmiController(adminUsecase)

routes.get("/users",(req,res,next)=>adminController.getUsers(req,res,next))
routes.post("/block-status/:id",(req,res,next)=>adminController.blockStatusUpdate(req,res,next))



export default routes