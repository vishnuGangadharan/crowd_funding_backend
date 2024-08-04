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


async getRequest() {
    try {
        const request = await this.adminRepository.getRequest()
        if(request){
            return {
                status:200,
                data:{
                    status:true,
                    data:request,
                    message:"Request retrieved successfully"
                }
            }
        }else{
            return {
                status:404,
                data:{
                    status:false,
                    data:null,
                    message:"No request found"
                }
            }
        }

    } catch (error) {
        console.log(error)
    }
   
}


async approvalPost(postId :string, status:string){
    const updateStatus = await this.adminRepository.updateStatus(postId,status)
    console.log("upa",updateStatus);
    
    if(updateStatus){
        return {
            status: 200,
            data:{
                status:true,
                message: "Updated success fully",
            }
        }
    }

}


async allReports(){
    const allReport = await this.adminRepository.getallReports()
   
    if(allReport){
        return {
            status :200,
            data :{
                status:true,
                data: allReport
            }
        }
    }

}
}
export default AdminUsecase