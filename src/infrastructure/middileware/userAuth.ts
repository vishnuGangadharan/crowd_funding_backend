import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../database/userModel";

export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    console.log("here");
    const authHeader = req.headers.authorization
    
    console.log("authheader",authHeader);
    
    if(!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ message: "Authorization header missing or invalid"})
    }
     
    const token  = authHeader.split(" ")[1];
    console.log("tokenn",token);
    

    try{
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;
        if(decodeToken.role !=="user") {
            return res.status(400).json({ message : "Unauthorized access"})
        }

        const userId = decodeToken.userId;
        const user = await UserModel.findById(userId)
        console.log("founddd",user);
        
        if(!user){
            return res.status(400).json({ message: "User not found"})
        }

        if(user.isBlocked){
            return res.status(403).json({ message : "User is blocked" ,accountType: "user" })
        }

        next();
    }catch(error : any){
        console.error("Error decoding token:", error.message);
    return res.status(401).json({ message: "Invalid token" });
    }
}