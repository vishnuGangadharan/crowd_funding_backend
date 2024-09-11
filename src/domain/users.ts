import mongoose from "mongoose";

 interface User{
    _id:string;
    name:string;
    email:string;
    phone:string;
    password:string;
    profilePicture:string;
    isVerified:boolean
    isBlocked:boolean;
    isFundraiser: boolean;
    isAdmin:boolean;
    isGoogle:boolean;
    lastSeen:Date;
}


export default User;

export interface walletType{
    userId: mongoose.Types.ObjectId | string;
    balance:number;
    transactions: {
        beneficiary: mongoose.Types.ObjectId | string;
        description: string;
        type: string; //debit/credit
        amount: number;
    }[];
}

export interface profit{
    totalProfit?: number;
    adminId?: mongoose.Types.ObjectId | string;
    transactions : {
        beneficiary?: mongoose.Types.ObjectId | string;
        amount?: number;
        date?: Date;
    };
}
