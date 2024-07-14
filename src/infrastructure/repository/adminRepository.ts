import AdminRepo from "../../useCase/interface/adminRepo"
import UserModel from "../database/userModel"

class AdminRepository implements AdminRepo{

   async findAllUsers(){
       const users = await UserModel.find({isAdmin:false})
       return users
   }
   async findByIdAndUpdate(id:string):Promise<boolean>{
       const user = await UserModel.findByIdAndUpdate(id,{isBlocked:true},{new:true})
       return user ? true : false
}
}
export default AdminRepository