import User from "../../domain/users";

interface AdminRepo{
    findAllUsers():Promise<User[]>;
    findByIdAndUpdate(id:string,status:boolean):Promise<boolean>;
}

export default AdminRepo;