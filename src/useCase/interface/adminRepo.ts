import beneficiary from "../../domain/beneficiary";
import { Donations } from "../../domain/donations";
import { PostReport } from "../../domain/postReport";
import User from "../../domain/users";
import { counts } from "../../domain/donations";
interface AdminRepo{
    findAllUsers(page:number, limit:number, searchTerm: string):Promise<{ users: User[], total: number }>;  
    findByIdAndUpdate(id:string,status:boolean):Promise<boolean>;
    getRequest():Promise<beneficiary[]>;
    updateStatus(postId:string, status:string): Promise<beneficiary | null>
    getallReports():Promise < PostReport[] | null>;
    blockPost(postId:string): Promise<beneficiary | null>;
    refundAllDonations(postId:string):Promise<boolean | null>;
    deleteDonations(postId:string) :Promise<void>
    getFundRequest():Promise<beneficiary[] | undefined>;
    confirmFunding(id: string): Promise<boolean> 
    getProfit(id:string):Promise<boolean>
    getDashboard():Promise<beneficiary[]>
    getDashboardCounts():Promise<counts>
}

export default AdminRepo;