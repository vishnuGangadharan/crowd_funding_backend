import beneficiary from "../../domain/beneficiary"
import AdminRepo from "../../useCase/interface/adminRepo"
import beneficiaryModel from "../database/beneficiaryModel"
import UserModel from "../database/userModel"

class AdminRepository implements AdminRepo{

   async findAllUsers(){
       const users = await UserModel.find({isAdmin:false})
       return users
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




}
export default AdminRepository