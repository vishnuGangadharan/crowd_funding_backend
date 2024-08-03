import  jwt  from "jsonwebtoken";
import JWT from "../../useCase/interface/jwt";


class jwtService implements JWT{
    generateToken(userId:string, role: string) : string{
        const secretKey = process.env.JWT_SECRET_KEY
        if(secretKey){
            const token = jwt.sign({userId,role},secretKey,{expiresIn: '7d'})
            return token
        }
        throw new Error("JWT_SECRET_KEY not found")
    }

    generateRefreshToken(userId:string,role:string){
        try{
            const secretKey = process.env.JWT_SECRET_KEY
            const payload = {userId,role}
            const refreshToken = jwt.sign(payload,secretKey as string ,{expiresIn:"6d"} )
            return refreshToken
        }catch(error){
            console.log("refreshtockn error",error);
            
        }
    }
}

export default jwtService