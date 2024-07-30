import UserRepository from "../infrastructure/repository/userRepository";
import OTPGenerator from "../infrastructure/services/otpGenerator";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import SendOtp from "../infrastructure/services/sendEmail";
import jwtService from "../infrastructure/services/generateTocken";
import beneficiary from "../domain/beneficiary";
import Cloudinary from "../infrastructure/services/cloudinary";
import User from "../domain/users";
import { log } from "console";

class UserUseCase {
    private userRepository: UserRepository;
    private OTPGenerator: OTPGenerator;
    private EncryptPassword: EncryptPassword;
    private GenerateMail: SendOtp
    private jwtService: jwtService
    private cloudinary: Cloudinary
    constructor(
        userRepository: UserRepository,
        OTPGenerator: OTPGenerator,
        EncryptPassword: EncryptPassword,
        GenerateMail: SendOtp,
        jwtService: jwtService,
        cloudinary: Cloudinary
    ) {
        this.userRepository = userRepository;
        this.OTPGenerator = OTPGenerator;
        this.EncryptPassword = EncryptPassword;
        this.GenerateMail = GenerateMail;
        this.jwtService = jwtService
        this.cloudinary = cloudinary
    }


    async checkAlreadyExist(email: string) {
        const userExist = await this.userRepository.findByEmail(email);
        if (userExist) {

            return {
                status: 400,
                data: {
                    status: false,
                    message: "User already exist"
                }
            }
        } else {
            return {
                status: 200,
                data: {
                    status: true,
                    message: "User does not exist"
                }
            }
        }
    }


    async signup(email: string, name: string, phone: string, password: string, isGoogle: boolean) {
        const otp = this.OTPGenerator.createOTP();
        const hashedPassword = await this.EncryptPassword.encryptPassword(password);
        await this.userRepository.saveOTP(otp, email, name, phone, hashedPassword);
        this.GenerateMail.sendEmail(email, otp)
        return {
            status: 200,
            data: {
                status: true,
                message: 'verification email send'
            }
        }
    }


    async verifyOtp(email: string, otp: number) {


        let findOtp = await this.userRepository.findOtpByEmail(email);

        if (!findOtp) {
            return {
                status: 400,
                data: {
                    status: false,
                    message: "invalid or expired otp"
                }
            }
        }
       

        let data: { name: string, email: string, phone?: string, password?:string} = {
            name: findOtp.name,
            email: findOtp?.email,
            phone: findOtp.phone,
            password:findOtp.password
        }
        console.log(data);

        let now = new Date().getTime()
        const otpGeneratedAt = new Date(findOtp.otpGeneratedAt).getTime()
        const otpExpiration = 2 * 60 * 1000; //2mints            
        if (now - otpGeneratedAt > otpExpiration) {
            console.log("expired");

            await this.userRepository.deleteOtpByEmail(email)
            return {
                status: 400,
                message: "otp has expired"
            }
        }

        if (findOtp.otp !== otp) {
            return { status: 400, message: "Invalid OTP" }
        }

        await this.userRepository.deleteOtpByEmail(email)

        return {
            status: 200,
            message: "OTP verified",
            data: data
        }

    }

    async verifyOtpUser(user: any) {
        //google auth
        if (user.isGoogle) {

            const hashedPassword = await this.EncryptPassword.encryptPassword(user.password)
            const newUser = { ...user, password: hashedPassword, isGoogle: true, isVerified: true }

            const userData = await this.userRepository.save(newUser)
            let data = {
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                isGoogle: userData.isGoogle
            }

            const token = this.jwtService.generateToken(newUser._id, "user")
            return {
                status: 200,
                data: data,
                message: "Google Verified Successfully",
                token: token
            }
        }

        let newUser = { ...user, isVerified: true }
        const userData = await this.userRepository.save(newUser)
        let data = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            isBlocked: userData.isBlocked,
        }


        let token = this.jwtService.generateToken(userData._id, "user")
        return {
            status: 200,
            data: data,
            message: "OTP Verified Successfully",
            token: token
        }


    }

    async login(email: string, password: string) {
        try {
            const user = await this.userRepository.findByEmail(email)
            let token = ""
            if (user) {
                let data = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    isBlocked: user.isBlocked,
                    isAdmin: user.isAdmin,


                }

                if (user.isBlocked) {
                    return {
                        status: 400,
                        data: {
                            status: false,
                            message: "User is blocked by the admin",
                            token: ""
                        }
                    }
                }

                const passwordMatch = await this.EncryptPassword.compare(password, user.password)
                if (passwordMatch && user.isAdmin) {
                    token = this.jwtService.generateToken(user._id, "admin")
                    return {
                        status: 200,
                        data: {
                            status: true,
                            message: data,
                            token,
                            isAdmin: true

                        }
                    }
                }
                console.log(passwordMatch);

                if (passwordMatch) {
                    token = this.jwtService.generateToken(user._id, "user")
                    return {
                        status: 200,
                        data: {
                            status: true,
                            message: data,
                            token
                        }
                    }
                } else {
                    return {
                        status: 400,
                        data: {
                            status: false,
                            message: "Invalid password",
                            token: ""
                        }
                    }
                }

            } else {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "Invalid Credentials",
                        token: ""
                    }
                }
            }
        } catch (error) {
            console.log(error);

        }

    }



    async editProfile(data: User, filePath: string) {
        try {
            const { name, email, phone } = data;
            console.log("2");
            console.log(data.email);
            if (filePath) {

                const cloudinary = await this.cloudinary.uploadImage(filePath, "profilePicture")
                console.log("cloudinary", cloudinary);

                data.profilePicture = cloudinary

            }
            const user = await this.userRepository.findByEmail(data.email)

            if (user) {
                const updateProfile = await this.userRepository.editProfile(data)
                if (updateProfile) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            message: "user updated successfully"
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);

        }

    }

    async findBeneficiary(data: beneficiary) {
        const { email, name, phone } = data
        const exists = await this.userRepository.verifyBeneficiary(email as string)
        console.log("finding exixt");
        
        if (exists) {
            console.log("yes exixt");

            return {
                status: 400,
                data: {
                    status: false,
                    message: "Beneficiary already exists"
                }
            }
        }
         else {
            
            const otp = this.OTPGenerator.createOTP();
            await this.userRepository.saveOTP(otp, email as string, name, phone);
            this.GenerateMail.sendEmail(email as string, otp)
            return {
                status: 200,
                data: {
                    data: email,
                    status: true,
                    message: 'verification email send'
                }
            }
        }
    }


    async fundRegister(data: beneficiary, fundraiserEmail: string,supportingDocs:string[],profilePic:string[]) {
        try {
            const currentUserId = await this.userRepository.findByEmail(fundraiserEmail)
            console.log(currentUserId);
            
            const beneficiaryEmail = data.email
            if (beneficiaryEmail) {
                const verifyBeneficiary = await this.userRepository.verifyBeneficiary(beneficiaryEmail)
                
                if (verifyBeneficiary) {
                    return {
                        status: 400,
                        data: {
                            status: false,
                            message: "Beneficiary already exists"
                        }
                    }
                }

            }
            if(supportingDocs && profilePic){
                console.log("cloudina");
                
                const cloudinary = await this.cloudinary.uploadMultipleimages( profilePic as any, "profilePicture")
                data.profilePic = cloudinary

                const multiPics = await this.cloudinary.uploadMultipleimages( supportingDocs as any, "supportingDocs")
                data.supportingDocs  = multiPics 
            


            if (currentUserId && beneficiaryEmail) {
                console.log("dataaaa",data);
                
                const saveBeneficiary = await this.userRepository.createFundraiser(data, currentUserId._id)
                if (saveBeneficiary) {
                    return {
                        status: 200,
                        data: {
                            status: true,
                            message: "Beneficiary Registered Successfully"
                        }
                    }
                }


            }
        }

        } catch (error) {
            console.log(error);

        }
    }


    async getBeneficiaries(userId: string) {

        try {
            const beneficiaries = await this.userRepository.getBeneficiaries(userId)
            if (beneficiaries) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: "Beneficiaries fetched successfully",
                        data: beneficiaries
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }


    async userDetails(userId: string) {
        const user = await this.userRepository.findById(userId)
        if (user) {
            return {
                status: 200,
                data: {
                    status: true,
                    data: user
                }
            }
        }
    }

    async getPostDetails(userId : string){
        const postDetails = await this.userRepository.getPostDetailsById(userId)
               
        if(postDetails){
            return {
                status :200,
                data: {
                    status: true,
                    data:postDetails
                }
            }
        }
    }


   async addComment(comment :string, postId:string, userId:string){
        const user = await this.userRepository.findById(userId)
        const userName = user?.name   
        const saveComment = await this.userRepository.createComment(comment, userId, postId, userName as string)
        if(saveComment){
            return {
            status:200,
            data : {
                status : true,
                message : "Comment Added Successfully"
            }
            } 
        }
   }

   
   async getComments(id:string){

    const allComments = await this.userRepository.getComments(id)
    if(allComments){
        return {
            status : 200,
             data : {
                status:true,
                data: allComments
             }
        }
    }

   }

}




export default UserUseCase