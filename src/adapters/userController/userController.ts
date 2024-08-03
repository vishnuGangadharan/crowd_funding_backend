import { Request, Response, NextFunction } from 'express';
import UserUseCase from '../../useCase/userUsecase';
import { log } from 'console';
import User from '../../domain/users';
import beneficiary from '../../domain/beneficiary';
import { PasswordData } from '../../domain/interface';


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
            
            const {name,email,phone}= req.body;
            const user = {name,email,phone}
            const filePath = req.file?.path
          
            
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
            const supportingDocs = files.supportingDocs;
//mycode

const beneficiariesJson = JSON.parse(req.body.beneficiaries);
    
// Log the parsed beneficiaries data
//console.log("Beneficiaries data:", beneficiariesJson);

const { category, ...rest } = beneficiariesJson;
//console.log("Category:", category);
const beneficiaryData = {
    ...rest,
    category,
    ...(category === 'education' ? {
      educationDetails: {
        instituteName: rest.instituteName,
        instituteState: rest.instituteState,
        instituteDistrict: rest.instituteDistrict,
        institutePostalAddress: rest.institutePostalAddress,
        institutePin: rest.institutePin,
      },
    } : {
      medicalDetails: {
        hospitalName: rest.hospitalName,
        hospitalPostalAddress: rest.hospitalPostalAddress,
        hospitalState: rest.hospitalState,
        hospitalDistrict: rest.hospitalDistrict,
        hospitalPin: rest.hospitalPin,
      },
    })
  };

  // Remove the top-level fields that are now nested
  if (category === 'education') {
    delete beneficiaryData.instituteName;
    delete beneficiaryData.instituteState;
    delete beneficiaryData.instituteDistrict;
    delete beneficiaryData.institutePostalAddress;
    delete beneficiaryData.institutePin;
  } else {
    delete beneficiaryData.hospitalName;
    delete beneficiaryData.hospitalPostalAddress;
    delete beneficiaryData.hospitalState;
    delete beneficiaryData.hospitalDistrict;
    delete beneficiaryData.hospitalPin;
  }
console.log("final",beneficiaryData);


//inside     
        //     const beneficiariesJson = req.body.beneficiaries;
        //    console.log("beneficiariesJson",beneficiariesJson);

           // const beneficiaries = JSON.parse(beneficiariesJson); 

           const fundraiserEmail = beneficiaryData.currentUserEmail;
            let supportingDocsPath = supportingDocs.map((val) => val.path);
            const profilePicPath = profilePic.map((val) => val.path)
   
           const register = await this.userUseCase.fundRegister(beneficiaryData, fundraiserEmail,supportingDocsPath,profilePicPath);

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


    async addComment(req: Request, res: Response, next: NextFunction){
        const {comment, postId, userId} = req.body;
        const saveComment = await this.userUseCase.addComment(comment, postId, userId);
        if(saveComment){
            return res.status(saveComment.status).json(saveComment.data)
        }
        
    }


    async getComments(req:Request, res : Response, next : NextFunction){
        const {id} = req.query;
        const comments = await this.userUseCase.getComments(id as string)
        if(comments){
            return res.status(comments.status).json(comments.data)
        }
        
    }

    async getAllPost(req: Request, res: Response, next: NextFunction){
        const posts = await this.userUseCase.allPost()

        if(posts){
            return res.status(posts.status).json(posts.data)
        }  
    }


    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            console.log("userid",userId);
            console.log("data",req.body);
            
            
            const { currentPassword , newPassword ,confirmPassword} = req.body;
            const data = { currentPassword , newPassword ,confirmPassword};
            const changePassword = await this.userUseCase.updatePassword(data as PasswordData, userId as string);
            if(changePassword){
            res.status( changePassword?.status).json(changePassword?.data)
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred while updating the password' });
        }
    }
    

}

export default UserController;