import AdminRepo from "../../useCase/interface/adminRepo"
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
}
export default AdminRepository