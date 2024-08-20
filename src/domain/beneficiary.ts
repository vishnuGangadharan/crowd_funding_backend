import { Schema } from "mongoose";




interface MedicalDetails {
    hospitalName: string;
    hospitalDistrict:string;
    hospitalState:string;
    hospitalPostalAddress: string;
    hospitalPin: string;
}

interface EducationDetails {
    instituteName: string;
    instituteDistrict:string;
    instituteState:string;
    institutePostalAddress: string
    institutePin: string;
}


interface beneficiary{

    fundraiser:{
        type: typeof Schema.Types.ObjectId;
        ref: "User"
    } //objectid
    name?:string;
    age?:number;
    email?:string;
    phone?:string;
    gender?:string;
    panNumber?:string;
    requestedAmount?:boolean;
    userAadharNumber?: string;
    description?: string;
    profilePic?: string[];
    supportingDocs?:string[];
    amount?:number;
    contributedAmount?:number;
    isVerified?:true;
    isApproved?: 'pending' | 'approved' | 'rejected';
    createdAt?:Date;
    startDate?:Date;
    targetDate?:Date;
    address?:string;
    heading?:string;
    medicalDetails?: MedicalDetails;
    educationDetails?: EducationDetails;
    relationWithBeneficiary?:string;
    fundraisingFor?:string;
    category?:string;
    bio?:string;
    blocked?:boolean;
    targetDateFinished:boolean;
}
export default beneficiary