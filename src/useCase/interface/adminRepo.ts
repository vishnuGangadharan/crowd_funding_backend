import beneficiary from "../../domain/beneficiary";
import User from "../../domain/users";

interface AdminRepo{
    findAllUsers():Promise<User[]>;
    findByIdAndUpdate(id:string,status:boolean):Promise<boolean>;
    getRequest():Promise<beneficiary[]>;
}

export default AdminRepo;