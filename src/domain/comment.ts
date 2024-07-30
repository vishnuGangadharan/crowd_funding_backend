import { Schema, Document } from "mongoose";

export interface comments extends Document {
    comment:string;
    userId: Schema.Types.ObjectId;
    postId : Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    userName: string
}