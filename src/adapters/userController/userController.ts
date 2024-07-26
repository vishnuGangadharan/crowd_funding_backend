import { Request, Response, NextFunction } from 'express';
import UserUseCase from '../../useCase/userUsecase';
import { log } from 'console';
import User from '../../domain/users';
import beneficiary from '../../domain/beneficiary';

interface MulterFiles {
    profilePics: Express.Multer.File[];
    supportingDocs: Express.Multer.File[];
  }

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
            console.log("req.body",req.body);
            console.log("req.file",req.file);
            
            const {name,email,phone}= req.body;
            const user = {name,email,phone}
            const filePath = req.file?.path
            console.log("1");
            
       const updateUser =await this.userUseCase.editProfile(user as User,filePath as string);
           if(updateUser){
            return res.status(updateUser.status).json(updateUser.data)
           }
         }
        catch (error) {
            next(error);
        }
    }


    async sendOtpForBeneficiary(req: Request, res: Response, next:NextFunction){
        try{
           console.log(req.body.email);
           const checkForExisting = await this.userUseCase.findBeneficiary(req.body)
          
            return res.status(checkForExisting.status).json(checkForExisting.data)
          
        }catch(error){
            next(error)
        }
    }

    async verifyOtpBeneficiary(req:Request,res:Response,next: NextFunction){
        try{
            console.log("lohh",req.body);
            
            const{otp,email} = req.body;
            console.log("otp",otp,"email",email);
           let verify = await this.userUseCase.verifyOtp(email,otp) 
           console.log("here");
           console.log(verify);
          

               return res.status(verify.status).json(verify.message)        
           
              
        }catch(error){
            next(error)
        }
    }
    

    async fileVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as unknown as MulterFiles;
            const profilePic = files.profilePics;
            console.log("profilepic",profilePic);
            
            const supportingDocs = files.supportingDocs;
            const beneficiariesJson = req.body.beneficiaries;

            const beneficiaries = JSON.parse(beneficiariesJson); 

            const fundraiserEmail = beneficiaries.currentUserEmail;
            let supportingDocsPath = supportingDocs.map((val) => val.path);
            const profilePicPath = profilePic.map((val) => val.path)
   
            const register = await this.userUseCase.fundRegister(beneficiaries, fundraiserEmail,supportingDocsPath,profilePicPath);

            if (register) {

                return res.status(register.status).json(register.data);
            }
        } catch (error) {
            next(error);
        }
    }


    async getBeneficiary(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.query.userId as string;
            
           const allBeneficiaries = await this.userUseCase.getBeneficiaries(userId);
           if(allBeneficiaries){
                return res.status(allBeneficiaries.status).json(allBeneficiaries.data);
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

    async getPostDetails(req:Request,res:Response,next:NextFunction){
        const userId = req.query.postId
        
        const response = await this.userUseCase.getPostDetails(userId as string)
        if(response){
            return res.status(response?.status).json(response.data)
        }
        
    }


}

export default UserController;