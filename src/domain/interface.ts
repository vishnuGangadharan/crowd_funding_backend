import  { Schema } from "mongoose";
import beneficiary from "./beneficiary";
export interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }



export interface updates {
  content?: string;
  postId?: Schema.Types.ObjectId;
  image?: string[];
  video?: string[];
}

export interface paginationBeneficiary {
  request?: beneficiary[];
  totalPages?:number
}