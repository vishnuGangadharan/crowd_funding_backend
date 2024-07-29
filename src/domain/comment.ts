import { Schema } from "mongoose";

export interface comments {
    comment:string;
    userId: Schema.Types.ObjectId;
    postId : Schema.Types.ObjectId;
    createdAt:Date;
}