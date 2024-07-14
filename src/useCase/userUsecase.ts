import UserRepository from "../infrastructure/repository/userRepository";
import OTPGenerator from "../infrastructure/services/otpGenerator";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import SendOtp from "../infrastructure/services/sendEmail";
import jwtService from "../infrastructure/services/generateTocken";


class UserUseCase {
    private userRepository: UserRepository;
    private OTPGenerator: OTPGenerator;
    private EncryptPassword: EncryptPassword;
    private GenerateMail : SendOtp
    private jwtService: jwtService
    constructor(
        userRepository: UserRepository,
       OTPGenerator: OTPGenerator,
       EncryptPassword: EncryptPassword,
       GenerateMail: SendOtp,
       jwtService:jwtService
    ) {
        this.userRepository = userRepository;
        this.OTPGenerator = OTPGenerator;
        this.EncryptPassword = EncryptPassword;
        this.GenerateMail = GenerateMail;
        this.jwtService = jwtService
    }


    async checkAlreadyExist(email: string) {
        const userExist = await this.userRepository.findByEmail(email);
        if(userExist){
            
            return {
                status: 400,
                data:{
                    status:false,
                    message: "User already exist"
                }
            }
        }else{
            return{
                status: 200,
                data:{
                    status:true,
                    message: "User does not exist"
                }
            }
        }
    }


    async signup(email: string, name: string, phone: string, password: string, isGoogle:boolean) {        
        const otp = this.OTPGenerator.createOTP();
        const hashedPassword = await this.EncryptPassword.encryptPassword(password);
        await this.userRepository.saveOTP(otp, email, name,phone, hashedPassword);
        this.GenerateMail.sendEmail(email, otp)
        return {
            status:200,
            data: {
                status:true,
                message: 'verification email send'
            }
        }
    }


    async verifyOtp(email:string, otp: number){
        let findOtp = await this.userRepository.findOtpByEmail(email);
        
        if(!findOtp){
            return {
                status: 400,
                data:{
                    status:false,
                    message: "invalid or expired otp"
                }
            }
        }
            let data :{name: string, email: string,phone: string, password:string} = {
                name: findOtp.name,
                email: findOtp.email,
                phone: findOtp.phone,
                password: findOtp.password
            }

            let now  = new Date().getTime()
            const otpGeneratedAt = new Date(findOtp.otpGeneratedAt).getTime()
            const otpExpiration = 2 * 60 * 1000; //2mints            
            if(now -otpGeneratedAt > otpExpiration){
                await this.userRepository.deleteOtpByEmail(email)
                return {
                    status:400,
                    message:"otp has expired"
                }
            }

            if(findOtp.otp !==otp){
                return {status:400, message:"Invalid OTP"}
            }

            await this.userRepository.deleteOtpByEmail(email)

            return {
                status:200,
                message:"OTP verified",
                data: data
            }
        
    }

    async verifyOtpUser(user:any){
        //googole auth
        if(user.isGoogle){
            console.log("kkkkkkkkkkkkkk");
            
            const hashedPassword = await this.EncryptPassword.encryptPassword(user.password)
            const newUser = {...user, password: hashedPassword,isGoogle:true, isVerified :true}
           
           const userData =   await this.userRepository.save(newUser)
           let data = {
            _id: userData._id,
            name: userData.name,
            email:userData.email,
            phone:userData.phone,
            isGoogle:userData.isGoogle
        }
           
          const token = this.jwtService.generateTocken(newUser._id, "user")           
            return {
                status:200,
                data:data,
                message:"Google Verified Successfully",
                token:token
            }
        }

        let newUser ={...user, isVerified:true}
        const userData = await this.userRepository.save(newUser)
        let data = {
            _id: userData._id,
            name: userData.name,
            email:userData.email,
            phone:userData.phone,
            isBlocked:userData.isBlocked,
        }
      
        
        let token = this.jwtService.generateTocken(userData._id, "user")
        return {
            status:200,
            data:data,
            message:"OTP Verified Successfully",
            token:token
        }


    }

    async login(email:string, password:string){
        try{
            const user = await this.userRepository.findByEmail(email)
            let token = ""
            if(user){
                let data = {
                    _id:user._id,
                    name:user.name,
                    email:user.email,
                    phone: user.phone,
                    isBlocked:user.isBlocked,
                    isAdmin:user.isAdmin,


                }

                if(user.isBlocked){
                    return {
                        status:400,
                        data:{
                            status:false,
                            message:"User is blocked by the admin",
                            token:""
                        }
                    }
                }

                const passwordMatch = await this.EncryptPassword.compare(password, user.password)
                if(passwordMatch && user.isAdmin){
                    token = this.jwtService.generateTocken(user._id, "admin")
                    return {
                        status:200,
                        data:{
                            status:true,
                            message:data,
                            token,
                            isAdmin:true

                        }
                    }
                }
                console.log(passwordMatch);
                
                if(passwordMatch){
                    token = this.jwtService.generateTocken(user._id, "user")
                    return{
                        status:200,
                        data:{
                            status:true,
                            message:data,
                            token
                        }
                    }
                }else{
                    return {
                        status:400,
                        data:{
                            status:false,
                            message:"Invalid password",
                            token:""
                        }
                    }
                }

            }else{
                return {
                    status:400,
                    data:{
                        status:false,
                        message:"Invalid Credentials",
                        token:""
                    }
                }
            }
        }catch(error){
            console.log(error);
            
        }

    }



    async editProfile(data:any){
        try{
            
            const user = await this.userRepository.findByEmail(data.email)
            if(user){
                if(data.currentPassword){
                    const passwordMatch = await this.EncryptPassword.compare(data.currentPassword, user.password)
                    if(!passwordMatch){
                        return {
                            status:400,
                            data:{
                                status:false,
                                message:"Invalid password"
                            }
                        }
                    }else{
                        if(data.newPassword === data.confirmPassword){
                            const hashedPassword = await this.EncryptPassword.encryptPassword(data.newPassword)
                            const newUserData = {
                                name:name,
                                phone:data.phone,
                                email:data.email,
                                password:hashedPassword
                            }
                        }
                    }
                }
            }
        }catch(error){
            console.log(error);
            
        }

    }

}




export default UserUseCase