import User from "../../domain/users";
import OTP from "../../domain/otp";
import beneficiary from "../../domain/beneficiary";

interface  UserRepo{
    findByEmail(email:string): Promise<User | null>;
    saveOTP(otp:number,email:string,name?:string,phone?:string,password?:string):Promise<any>;
    findOtpByEmail(email:string): Promise<any>;
    deleteOtpByEmail(email:string):Promise<any>;
    save(user:User):Promise<User>;
    // createFundraiser(data:beneficiary,fundraiser:string):Promise<beneficiary>;
    verifyBeneficiary(email:string):Promise<any>;
    getBenificiers(userId:string):Promise<any>;
    editProfile(data:User,profilePicture:string):Promise<User| null >
    findById(id:string):Promise<User | null>;
}


export default UserRepo;