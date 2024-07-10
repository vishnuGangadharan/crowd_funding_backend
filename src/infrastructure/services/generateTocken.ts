import  jwt  from "jsonwebtoken";
import JWT from "../../useCase/interface/jwt";


class jwtService implements JWT{
    generateTocken(userId:string, role: string) : string{
        const secretKey = process.env.JWT_SECRET_KEY
        if(secretKey){
            const token = jwt.sign({userId,role},secretKey,{expiresIn: '7d'})
            return token
        }
        throw new Error("JWT_SECRET_KEY not found")
    }
}

export default jwtService