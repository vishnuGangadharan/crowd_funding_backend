import mongoose from "mongoose";

export interface PostReport {
    postId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    reason?: string;
    comment?: string;
    createdAt?: Date;
    updatedAt?: Date;
    image? : string | null;
    count? : number | undefined;
}