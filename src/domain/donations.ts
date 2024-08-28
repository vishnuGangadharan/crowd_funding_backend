 import mongoose from "mongoose";
 import beneficiary from "./beneficiary";
 import { profit } from "./users";
 export interface Donations {
    beneficiaryId: mongoose.Types.ObjectId |string;
    userId: mongoose.Types.ObjectId | string;
    amount: number;
    createdAt: Date;
    anonymousName: string;
    method: string;
 }

 export interface counts  {
   totalPosts?: number;
   postsThisMonth?: number;   
   completedPosts?: number;
   totalProfit?: profit;
   beneficiary?: beneficiary[];
 }







