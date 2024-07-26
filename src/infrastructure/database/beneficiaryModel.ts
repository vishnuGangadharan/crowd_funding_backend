import mongoose, { Model, Schema } from "mongoose";
import beneficiary from "../../domain/beneficiary";

const beneficiarySchema : Schema = new Schema<beneficiary | Document>({
    fundraiser: {
        type: Schema.Types.ObjectId,
        ref: "User",
         required: true
        },
    fundraisingFor:{type:String, required:false},
    category:{type:String, required:true},
    relationWithBeneficiary:{type:String, required:false},
    name:{type:String, required:true},
    age:{type:Number, required:true},
    gender:{type:String, required:true},
    email:{type:String, required:true},
    isApproved: { 
        type: String, 
        enum: ['approved', 'pending', 'rejected'], 
        default: 'pending',
        required: true
      },
    phone:{type:String},
    panNumber:{type:String, required:true},
    userAadharNumber:{type:String, required:true},
    profilePic:{type:[String],required:true},
    supportingDocs:{type:[String],},
    amount:{type:Number, required:true},
    contributedAmount:{type:String,default:0},
    isVerified:{type:Boolean},
    //createdAt:{type:Date, default: Date.now},
    startDate:{type:Date},
    targetDate:{type:Date, required:true},
    address:{type:String, required:true},
    heading:{type:String, required:true},
    bio:{type:String, required:true},
    medicalDetails: {
        hospitalName: { type: String },
        hospitalPostalAddress: { type: String },
        hospitalState: { type: String },
        hospitalDistrict: { type: String },
        hospitalPin: { type: String }
    },
    educationDetails: {
        instituteName: { type: String },
        instituteDistrict: { type: String },
        institutePostalAddress: { type: String },
        instituteState: { type: String },
        institutePin: { type: String }
    }
},{ timestamps: true })


const beneficiaryModel :Model<beneficiary & Document> = mongoose.model<beneficiary & Document>("beneficiary", beneficiarySchema);
export default beneficiaryModel


