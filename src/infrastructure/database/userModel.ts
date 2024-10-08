import mongoose, { Schema, Model }  from "mongoose";
import User from "../../domain/users";

const userSchema:Schema = new Schema<User | Document>({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String,
         required: true
        },
    phone: {
        type: String,
         required: true
        },
    password: {
        type: String, 
        required: true
        },
    isVerified:{
        type:Boolean, 
        default:false
        },
    profilePicture: {
        type: String,
         default: "https://www.w3schools.com/w3images/avatar2.png"
        },
    isFundraiser: {
        type:Boolean , 
        default: false
        },
    isBlocked: {
        type: Boolean,
         default: false
        },
    isAdmin: {
        type: Boolean, 
        default: false
        },
    isGoogle: {
        type: Boolean, 
        default: false
      },
      lastSeen: {
        type : Date,
        default: null
    }
},{ timestamps: true });

const UserModel:Model<User&Document>=mongoose.model<User & Document>("User", userSchema);

export default UserModel;