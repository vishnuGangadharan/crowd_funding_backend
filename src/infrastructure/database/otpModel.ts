import mongoose,{Model, Schema,model} from "mongoose";
import OTP from "../../domain/otp";

const OTPSchema:Schema = new Schema<OTP>({
    name:{type:String},
    email:{type: String, required:true},
    phone:{type: String},
    password:{type: String},
    otp:{type:Number, required:true},
    otpGeneratedAt:{type: Date, required:true}, 
    otpExpiredAt:{type: Date, required:true}
})

const OTPModel : Model<OTP&Document>=mongoose.model<OTP & Document>("OTP",OTPSchema);

export default OTPModel;    