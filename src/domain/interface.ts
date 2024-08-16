import  { Schema } from "mongoose";

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