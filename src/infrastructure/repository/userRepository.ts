import User from "../../domain/users";
import  UserRepo  from "../../useCase/interface/userRepo";
import UserModel from "../database/userModel";
import OTPModel from "../database/otpModel";
import beneficiaryModel from "../database/beneficiaryModel";
import beneficiary from "../../domain/beneficiary";
import { emit } from "process";
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
        console.log("deletd");
        
        return OTPModel.deleteOne({email})
    }

    async save(user:User):Promise<User> {
        const newUser = new UserModel(user)
        const savedUser = await newUser.save();
        return savedUser;
    }

    async verifyBeneficiary(email: string): Promise<any> {
        const existBeneficiary = await beneficiaryModel.findOne({ email });
        return existBeneficiary
    }



    async createFundraiser(beneficiary: beneficiary, fundraiser: string): Promise<beneficiary> {
        console.log("creation final check",beneficiary);
        
        const newBeneficiary = new beneficiaryModel({
            ...beneficiary,
            fundraiser: fundraiser,
        });
        const savedBeneficiary = await newBeneficiary.save();
        console.log("ben", savedBeneficiary._id);
        return savedBeneficiary.toObject();
    }

    async getBeneficiaries(userId:string): Promise<any> {
        const beneficiaries = await beneficiaryModel.find({fundraiser:userId});
        return beneficiaries;
    }


    async editProfile(user:{name:string,email:string,phone:string,profilePicture:string}):Promise<any>{
        console.log("updated user",user);
        
        const updateUser = await UserModel.updateOne(
            {email:user.email},
            { $set:{name:user.name,phone:user.phone,email:user.email,profilePicture:user.profilePicture}})
            return updateUser.modifiedCount > 0
    }


    async findById(id: string): Promise<User | null>{
        const userData = await UserModel.findById(id).exec()
        return userData
    }
}


export default UserRepository