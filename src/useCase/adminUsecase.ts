import exp from "constants";
import { Request, Response,NextFunction } from "express";
import AdminRepository from "../infrastructure/repository/adminRepository";

class AdminUsecase {
    private adminRepository: AdminRepository;
    constructor(adminRepository: AdminRepository) {
        this.adminRepository = adminRepository;

    }


    async getUsers(page: number, limit:number, searchTerm : string) {
        try {
            const users = await this.adminRepository.findAllUsers(page, limit, searchTerm) 
            if(users){
                return {
                    status:200,
                    data:{
                        status:true,
                        data:users.users,
                        total:users.total,
                        page,
                        limit,
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

async getPostDetails(userId : string){
    const postDetails = await this.adminRepository.getPostDetailsById(userId)
           
    if(postDetails){
        return {
            status :200,
            data: {
                status: true,
                data:postDetails
            }
        }
    }
}

async blockPost(postId:string){
    const blockPost = await this.adminRepository.blockPost(postId)

    console.log("block",);blockPost
    const donations  = await this.adminRepository.refundAllDonations(postId)
    if(donations){
        const deleteDonations = await this.adminRepository.deleteDonations(postId)
     }
    
    // const splitContributionToDonators = 
    if(blockPost){
        return {
            status :200,
            data: {
                status: true,
                message: "Post blocked successfully"
            }
        }
    }
}


async getFundRequest(){
    const response = await this.adminRepository.getFundRequest()
    if(response){
        return {
            status:200,
            data:{
                status:true,
                data:response,
            }
        }
    }
}


async confirmFunding(id: string){
    const confirmFunding = await this.adminRepository.confirmFunding(id)
    if(confirmFunding){
        const getProfit = await this.adminRepository.getProfit(id)    
    
    }

}


async getDashboard(){
    const getDashboard = await this.adminRepository.getDashboard()
    if(getDashboard){
        return {
            status:200,
            data:{
                status:'true',
                data:getDashboard
            }
        }
    }
}


 async getDashboardCounts(){
    const getDashboardCounts = await this.adminRepository.getDashboardCounts()
    if(getDashboardCounts){
        return {
            status:200,
            data:{
                status:'true',
                data:getDashboardCounts
            }
        }
    }
 }

}
export default AdminUsecase