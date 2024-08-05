 import mongoose from "mongoose";
 
 export interface Donations {
    beneficiaryId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    amount: number;
    createdAt: Date;
    anonymousName: string;
 }