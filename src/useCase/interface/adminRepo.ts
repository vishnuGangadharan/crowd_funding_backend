import User from "../../domain/users";

interface AdminRepo{
    findAllUsers():Promise<User[]>;
    findByIdAndUpdate(id:string):Promise<boolean>;
}

export default AdminRepo;