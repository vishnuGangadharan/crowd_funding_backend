import UserRepository from "../infrastructure/repository/userRepository";
import OTPGenerator from "../infrastructure/services/otpGenerator";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import SendOtp from "../infrastructure/services/sendEmail";


class UserUseCase {
    private userRepository: UserRepository;
    private OTPGenerator: OTPGenerator;
    private EncryptPassword: EncryptPassword;
    private GenerateMail : SendOtp
    constructor(
        userRepository: UserRepository,
       OTPGenerator: OTPGenerator,
       EncryptPassword: EncryptPassword,
       GenerateMail: SendOtp
    ) {
        this.userRepository = userRepository;
        this.OTPGenerator = OTPGenerator;
        this.EncryptPassword = EncryptPassword;
        this.GenerateMail = GenerateMail;
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


    async signup(email: string, name: string, password: string, phone: string) {
        const otp = this.OTPGenerator.createOTP();
        const hashedPassword = await this.EncryptPassword.encryptPassword(password);
        await this.userRepository.saveOTP(email, otp, hashedPassword, phone, name);
        this.GenerateMail.sendEmail(email, otp)
        return {
            status:200,
            data: {
                status:true,
                message: 'verification email send'
            }
        }
    }
}


export default UserUseCase