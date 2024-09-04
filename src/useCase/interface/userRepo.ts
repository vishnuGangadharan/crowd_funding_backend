import User, { walletType } from "../../domain/users";
import OTP from "../../domain/otp";
import beneficiary from "../../domain/beneficiary";
import { comments } from "../../domain/comment";
import { PostReport } from "../../domain/postReport";
import { Donations } from "../../domain/donations";
import { updates } from "../../domain/interface";
import { totalPages } from "../../infrastructure/repository/userRepository";
interface  UserRepo{
    findByEmail(email:string): Promise<User | null>;
    saveOTP(otp:number,email:string,name?:string,phone?:string,password?:string):Promise<any>;
    findOtpByEmail(email:string): Promise<any>;
    deleteOtpByEmail(email:string):Promise<any>;
    save(user:User):Promise<User>;
    // createFundraiser(data:beneficiary,fundraiser:string):Promise<beneficiary>;
    verifyBeneficiary(email:string):Promise<any>;
    getBeneficiaries(userId:string):Promise<any>;
    editProfile(data:User):Promise<User| null >
    findById(id:string):Promise<User | null>;
    getPostDetailsById(userId : string) : Promise <beneficiary | null >
    createComment(comment: string, userId: string, postId: string, userName:string): Promise<comments>;
    getComments(id: string) : Promise<comments[]>;
    getAllPost(searchTerm:string,skip:number,limit:number, category:string) : Promise<totalPages>
    updatePassword(password:string, userId:string):Promise <User| null>
    findPostById(postId:string):Promise < beneficiary | null>
    createReport(reportData : PostReport) : Promise <PostReport | boolean>
    saveDonation(donationData:Donations):Promise<Donations>;
    getDonations(userId:string):Promise<Donations[]>;
    updateContribution(amount:number , beneficiaryId:string, userId: string, method:string):Promise<boolean>
    findReport(userId:string): Promise<PostReport | null>
    updateBeneficiary(content:string,video:string[],image:string[],postId:string):Promise<boolean>
    getStatusUpdates(postId:string): Promise<updates[] | null>
    getCountReport(postId:string): Promise<number | null>
    amountReached(amount : number ,beneficiaryId :string ) : Promise<{ targetAmount: number, amountRaised: number }>
    updateFundraiser(userId :string) :Promise<Boolean>
    getWallet(userId:string):Promise<walletType[]>;
    checkWallet(amount:number, userId:string ):Promise<boolean | null>;
    makeFundRequest(id: string): Promise<boolean>

}


export default UserRepo;