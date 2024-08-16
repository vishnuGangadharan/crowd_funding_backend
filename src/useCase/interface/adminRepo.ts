import beneficiary from "../../domain/beneficiary";
import { PostReport } from "../../domain/postReport";
import User from "../../domain/users";

interface AdminRepo{
    findAllUsers(page:number, limit:number, searchTerm: string):Promise<{ users: User[], total: number }>;  
    findByIdAndUpdate(id:string,status:boolean):Promise<boolean>;
    getRequest():Promise<beneficiary[]>;
    updateStatus(postId:string, status:string): Promise<beneficiary | null>
    getallReports():Promise < PostReport[] | null>;
    blockPost(postId:string): Promise<beneficiary | null>;
}

export default AdminRepo;