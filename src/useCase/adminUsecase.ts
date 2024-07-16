import exp from "constants";
import { Request, Response,NextFunction } from "express";
import AdminRepository from "../infrastructure/repository/adminRepository";

class AdminUsecase {
    private adminRepository: AdminRepository;
    constructor(adminRepository: AdminRepository) {
        this.adminRepository = adminRepository;

    }


    async getUsers() {
        try {
            const users = await this.adminRepository.findAllUsers() 
            if(users){
                return {
                    status:200,
                    data:{
                        status:true,
                        data:users,
                        message:"Users retrieved successfully"
                    }
                }
            }else{
                return {
                    status:404,
                    data:{
                        status:false,
                        data:null,
                        message:"No users found"
                    }
                }
            }
            
        } catch (error) {
            console.log(error)
        }
    }

    async handleBlockStatus(userId:string, statuss:boolean) {
        try {
            const user = await this.adminRepository.findByIdAndUpdate(userId, statuss)
            if(user){
                return {
                    status:200,
                    data:{
                        status:true,
                        data:user,
                        message:"User blocked successfully"
                    }
                }
            }else{
                return {
                    status:404,
                    data:{
                        status:false,
                        data:null,
                        message:"User not found"
                    }
                }
            }

        } catch (error) {
            console.log(error)
        }
}

   
}
export default AdminUsecase