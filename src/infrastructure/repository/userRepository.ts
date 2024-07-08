import User from "../../domain/users";
import  UserRepo  from "../../useCase/interface/userRepo";
import UserModel from "../database/userModel";
import OTPModel from "../database/otpModel";

class UserRepository implements UserRepo {

    async findByEmail(email: string): Promise<User | null> {
        const userData = await UserModel.findOne({ email });    
        return userData
    }

    async saveOTP(
        email: string,
        otp:number,
        name?: string,
        phone?:string,
        password?:string,
    ):Promise<any>{
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

}

export default UserRepository