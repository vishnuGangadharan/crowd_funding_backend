import beneficiary from "../../domain/beneficiary"
import { PostReport } from "../../domain/postReport"
import AdminRepo from "../../useCase/interface/adminRepo"
import beneficiaryModel from "../database/beneficiaryModel"
import PostReportModel from "../database/postReportModel"
import UserModel from "../database/userModel"

class AdminRepository implements AdminRepo{

   async findAllUsers(page:number, limit:number, searchTerm: string){
    const skip = (page-1) * limit
    const query = searchTerm?
        {
            isAdmin:false,$or:[
                {name:{$regex:searchTerm,$options:'i'}},
                {email:{$regex:searchTerm,$options:'i'}}
            ]
        }
        :{ isAdmin:false}
       const users = await UserModel.find(query).skip(skip).limit(limit).lean()
       const total = await UserModel.countDocuments(query)
       return {users, total}
   }
   async findByIdAndUpdate(id:string,status:boolean):Promise<boolean>{
       const user = await UserModel.findByIdAndUpdate(id,{isBlocked:status},{new:true})
       return user ? true : false
}

    async getRequest(){
       const request = await beneficiaryModel.find({})
       return request

    }

    async updateStatus(postId: string, status: string): Promise<beneficiary | null> {
        const update = await beneficiaryModel.findByIdAndUpdate(postId,{isApproved:status},{new: true})
        return update
    }

    async getallReports(): Promise<PostReport[] | null> {
        const allReport = await PostReportModel.find({})
        return allReport

    }

    async getPostDetailsById(userId: string): Promise<beneficiary | null> {
        const postData = await beneficiaryModel.findById(userId).populate('fundraiser').exec() 
        return postData
        
    }

    async blockPost(postId: string): Promise<beneficiary | null> {
        const blockPost = await beneficiaryModel.findByIdAndUpdate(postId,{blocked:true},{new:true})
        return blockPost 
    }


}
export default AdminRepository