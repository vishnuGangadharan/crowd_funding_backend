import User from "../../domain/users";
import  UserRepo  from "../../useCase/interface/userRepo";
import UserModel from "../database/userModel";
import OTPModel from "../database/otpModel";
import beneficiaryModel from "../database/beneficiaryModel";
import beneficiary from "../../domain/beneficiary";
class UserRepository implements UserRepo {

    async findByEmail(email: string): Promise<User | null> {
        const userData = await UserModel.findOne({ email });  
        console.log("userData",userData);
          
        return userData
    }

    async saveOTP(otp:number,email: string,name?: string,phone?:string,password?:string,):Promise<any>{
        const otpDoc = new OTPModel({
            email,
            name,
            phone,
            password,
            otp,
            otpGeneratedAt: new Date(),
            otpExpiredAt: new Date(Date.now() + 1000 * 60 * 60)
        })
        
        const saveDoc = await otpDoc.save()
        return saveDoc;
    }

    async findOtpByEmail(email:string): Promise<any>{
        const otpData = await OTPModel.findOne({ email }).sort({otpGeneratedAt:-1})
        console.log("otpdata",otpData);
        
        return otpData
    }

    async deleteOtpByEmail(email:string):Promise<any>{
        return OTPModel.deleteOne({email})
    }

    async save(user:User):Promise<User> {
        const newUser = new UserModel(user)
        const savedUser = await newUser.save();
        return savedUser;
    }


    async createFundraiser(benificiarys:beneficiary,fundraiser:string):Promise<beneficiary>{
        const newBenificiary = new beneficiaryModel({
            ...benificiarys,
            fundraiser:fundraiser
        })
        const savedBenificiary = await newBenificiary.save();

        return savedBenificiary;
    }

}

export default UserRepository