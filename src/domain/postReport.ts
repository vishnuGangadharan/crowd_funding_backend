import mongoose from "mongoose";
import beneficiary from "./beneficiary";
import User from "./users";
export interface PostReport {
    postId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    reason?: string;
    comment?: string;
    createdAt?: Date;
    updatedAt?: Date;
    image? : string | null;
    count? : number | undefined;
    beneficiary?:beneficiary
    user?:User
}