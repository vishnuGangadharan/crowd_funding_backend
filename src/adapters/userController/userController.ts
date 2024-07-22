import { Request, Response, NextFunction } from 'express';
import UserUseCase from '../../useCase/userUsecase';
import { log } from 'console';
import User from '../../domain/users';



class UserController {
    private userUseCase: UserUseCase;
    constructor(userUseCase: UserUseCase){
        this.userUseCase = userUseCase;
    }

 async signup(req: Request, res: Response, next: NextFunction){
    try {
       console.log("req.body",req.body);
       
        const varifyUser = await this.userUseCase.checkAlreadyExist(req.body.email);

        if(varifyUser.data.status=== true && req.body.isGoogle){
            const user = await this.userUseCase.verifyOtpUser(req.body)
            console.log("userllllllllll",user);
            
            return res.status(user.status).json(user.data)
            
        }
        
    
    if(varifyUser.data.status=== true){ 
        const sendOTP = await this.userUseCase.signup(
            req.body.email,
            req.body.name,
            req.body.phone,
            req.body.password,
            req.body.isGoogle,
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
            console.log("here");
            
            const {name,email,phone}= req.body;
            const user = {name,email,phone}
            const filePath = req.file?.path
            console.log("1");
            
       const updateUser =await this.userUseCase.editProfile(user as User,filePath as string);
           
         }
        catch (error) {
            next(error);
        }
    }


    async fundRegister(req: Request, res: Response, next: NextFunction) {
        try {
            // console.log(req.body);
            let fundraiser = req.body.currentUserEmail
            const register = await this.userUseCase.fundRegister(req.body,fundraiser);
            if(register){
                return res.status(register.status).json(register.data);
            }
        } catch (error) {
            next(error);
        }
    }

    //profile pic here 

    async fileVerification(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("here");
            const {profilePic,supportingDocs} = req.files as { profilePic: Express.Multer.File[], supportingDocs: Express.Multer.File[] };
            console.log("profilePic",profilePic);
            console.log("supportingDocs",supportingDocs);

                        
        }catch (error) {
            next(error);
        }
            
    }


    async getBenificiers(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.query.userId as string;
            
           const allBenificiers = await this.userUseCase.getBenificiers(userId);
           if(allBenificiers){
                return res.status(allBenificiers.status).json(allBenificiers.data);
            }
        }
        catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction){
        const userId = req.query.userId as string;        
        const user = await this.userUseCase.userDetails(userId)
        console.log("user",user);
        
        if(user){
            return res.status(user?.status).json(user?.data)
        }
    }


}

export default UserController;