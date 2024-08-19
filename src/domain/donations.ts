 import mongoose from "mongoose";
 
 export interface Donations {
    beneficiaryId: mongoose.Types.ObjectId |string;
    userId: mongoose.Types.ObjectId | string;
    amount: number;
    createdAt: Date;
    anonymousName: string;
    method: string;
 }