interface User{
    _id:string;
    name:string;
    email:string;
    phone:string;
    password:string;
    isVerified:boolean
    isBlocked:boolean;
    isAdmin:boolean;
    isGoogle:boolean;
}
export default User;