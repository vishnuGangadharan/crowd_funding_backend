import { Request, Response, NextFunction } from 'express';
import UserModel from '../../infrastructure/database/userModel';
import UserUseCase from '../../useCase/userUsecase';
import OTPGenerator from '../../infrastructure/services/otpGenerator';




class UserController {
    private userUseCase: UserUseCase;
    private otpGenerator: OTPGenerator;
    constructor(userUseCase: UserUseCase){
        this.userUseCase = userUseCase;
        this.otpGenerator = new OTPGenerator();
    }

 async signup(req: Request, res: Response, next: NextFunction){
    try {
        console.log("here");
        
        const varifyUser = await this.userUseCase.checkAlreadyExist(req.body.email);
        
    
    if(varifyUser.data.status=== true){ 
        const sendOTP = await this.userUseCase.signup(
            req.body.email,
            req.body.name,
            req.body.phone,
            req.body.password
        )
        return res.status(sendOTP.status).json(sendOTP.data);

    }else{
        return res.status(varifyUser.status).json(varifyUser.data)
    }
    } catch (error) {
        next(error);
        console.log(error);
    }
}


async verifyOTP(req:Request,res:Response,next:NextFunction){
    try {
  
       const{otp,email} = req.body;
        console.log("otp",otp,"email",email);
        
       let verify = await this.userUseCase.verifyOtp(email,otp)
        if(verify.status == 400){
            return res.status(verify.status).json({message:verify.message });
        }else if(verify.status ==200){
            let save =await this.userUseCase.verifyOtpUser(verify.data)
            if(save){
                return res.status(save.status).json(save);            }
        }

    }catch (error) {
        next(error);
    }
    }


    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const {email , password} = req.body;
            const user =await this.userUseCase.login(email, password);
            if(user){

                return res.status(user.status).cookie('jwt',user.data.token).json(user.data );
            }
            
            
        }
        catch (error) {
            next(error);
        }
    }



    async editProfile(req: Request, res: Response, next: NextFunction) {
        try {
            
            const data= req.body;
            console.log("data",data);
        const user =await this.userUseCase.editProfile(data);
           
         }
        catch (error) {
            next(error);
        }
    }
}
export default UserController;