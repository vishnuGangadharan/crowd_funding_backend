import User from "../../domain/users";
import OTP from "../../domain/otp";
import beneficiary from "../../domain/beneficiary";
import { comments } from "../../domain/comment";

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
    getAllPost() : Promise<beneficiary[]>
    updatePassword(password:string, userId:string):Promise <User| null>

}


export default UserRepo;