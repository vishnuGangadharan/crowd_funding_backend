import mongoose from "mongoose";

export interface PostReport {
    postId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    reason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}