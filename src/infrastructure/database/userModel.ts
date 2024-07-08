import mongoose, { Schema, Model }  from "mongoose";
import User from "../../domain/users";

const userSchema:Schema = new Schema<User | Document>({
    name: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: true},
    password: {type: String, required: true},
    isBlocked: {type: Boolean, required: true},
    isAdmin: {type: Boolean, required: true},
    isGoogle: {type: Boolean, required: true},
});

const UserModel:Model<User&Document>=mongoose.model<User & Document>("User", userSchema);

export default UserModel;