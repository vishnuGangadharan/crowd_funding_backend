interface User{
    _id:string;
    name:string;
    email:string;
    phone:string;
    password:string;
    profilePicture:string;
    isVerified:boolean
    isBlocked:boolean;
    isFundraiser: boolean;
    isAdmin:boolean;
    isGoogle:boolean;
}
export default User;