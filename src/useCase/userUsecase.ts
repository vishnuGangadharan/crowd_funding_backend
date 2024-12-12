import UserRepository from "../infrastructure/repository/userRepository";
import OTPGenerator from "../infrastructure/services/otpGenerator";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import SendOtp from "../infrastructure/services/sendEmail";
import jwtService from "../infrastructure/services/generateTocken";
import beneficiary from "../domain/beneficiary";
import Cloudinary from "../infrastructure/services/cloudinary";
import User from "../domain/users";
import { PasswordData } from "../domain/interface";
import { PostReport } from "../domain/postReport";
import Stripe from "stripe";
import { Donations } from "../domain/donations";


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
        console.log('findOtp', findOtp);
        if (findOtp.otp !== otp) {
            console.log('jjjjjj');
            
            return {
                status: 400,
                data: {
                    status: false,
                    message: 'invalid or expired otp'
                }
            }
        }
       


        let data: { name: string, email: string, phone?: string, password?: string } = {
            name: findOtp.name,
            email: findOtp?.email,
            phone: findOtp.phone,
            password: findOtp.password
        }

        let now = new Date().getTime()
        const otpGeneratedAt = new Date(findOtp.otpGeneratedAt).getTime()
        const otpExpiration = 2 * 60 * 1000;           
        if (now - otpGeneratedAt > otpExpiration) {

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
            let refreshToken = this.jwtService.generateRefreshToken(newUser._id, "user")
            return {
                status: 200,
                data: data,
                message: "Google Verified Successfully",
                token: token,
                refreshToken: refreshToken
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
        let refreshToken = this.jwtService.generateRefreshToken(newUser._id, "user")

        return {
            status: 200,
            data: data,
            message: "OTP Verified Successfully",
            token: token,
            refreshToken: refreshToken
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

            if (filePath) {

                const cloudinary = await this.cloudinary.uploadImage(filePath, "profilePicture")

                data.profilePicture = cloudinary

            }
            const user = await this.userRepository.findByEmail(data.email)

            if (user) {
                const updateProfile = await this.userRepository.editProfile(data)
                
                if (updateProfile) {
                    return {
                        status: 200,
                        data: {
                            data: updateProfile,
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

        if (exists) {

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


    async fundRegister(data: beneficiary, fundraiserEmail: string, supportingDocs: string[], profilePic: string[]) {
        try {
            const currentUserId = await this.userRepository.findByEmail(fundraiserEmail)

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
            if (supportingDocs && profilePic) {

                const cloudinary = await this.cloudinary.uploadMultipleimages(profilePic as any, "profilePicture")
                data.profilePic = cloudinary

                const multiPics = await this.cloudinary.uploadMultipleimages(supportingDocs as any, "supportingDocs")
                data.supportingDocs = multiPics



                if (currentUserId && beneficiaryEmail) {

                    const saveBeneficiary = await this.userRepository.createFundraiser(data, currentUserId._id)
                   const updateUserAsFundraiser = this.userRepository.updateFundraiser(currentUserId._id)
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

    async getPostDetails(userId: string) {
        const postDetails = await this.userRepository.getPostDetailsById(userId)

        if (postDetails) {
            return {
                status: 200,
                data: {
                    status: true,
                    data: postDetails
                }
            }
        }
    }


    async addComment(comment: string, postId: string, userId: string) {
        const user = await this.userRepository.findById(userId)
        const userName = user?.name
        const saveComment = await this.userRepository.createComment(comment, userId, postId, userName as string)
        console.log('commetntttt',saveComment);
        
        if (saveComment) {
            return {
                status: 200,
                data: {
                    status: true,
                    data : saveComment,
                    message: "Comment Added Successfully"
                }
            }
        }
    }


    async getComments(id: string) {

        const allComments = await this.userRepository.getComments(id)
        if (allComments) {
            return {
                status: 200,
                data: {
                    status: true,
                    data: allComments
                }
            }
        }

    }


    async allPost(searchTerm : string,skip: number,limit: number, category?: string) {
        const posts = await this.userRepository.getAllPost(searchTerm,skip,limit, category as string)
        if (posts) {
            return {
                status: 200,
                data: {
                    status: true,
                    data: posts,
                }
            }
        }
    }

    async updatePassword(data: PasswordData, userId: string) {
        try {

            const user = await this.userRepository.findById(userId)

            if (user && data.newPassword) {
                const match = await this.EncryptPassword.compare(data.currentPassword, user.password)
                if (match) {
                    const hashedPassword = await this.EncryptPassword.encryptPassword(data.newPassword)
                    const updateUser = await this.userRepository.updatePassword(hashedPassword, userId)

                    if (updateUser) {

                        return {
                            status: 200,
                            data: {
                                status: true,
                                message: "updated successfully"
                            }
                        }
                    }

                } else {
                    return {
                        status: 400,
                        data: {
                            status: false,
                            message: "current password not match"
                        }
                    }

                }
            }

        } catch (error) {
            console.log(error);

        }
    }


    async reportPost(reportData: PostReport) {

        if (reportData.image) {
            const cloudinary = await this.cloudinary.uploadImage(reportData.image, "reportImage")
            reportData.image = cloudinary
        }
        const post = await this.userRepository.findPostById(reportData.postId as unknown as string)
        const allReadyReported = await this.userRepository.findReport(reportData.userId as any)
        if (allReadyReported) {

            return {
                status: 400,
                data: {
                    status: false,
                    message: "Your report has been already submitted"
                }
            }
        }
        const count = await this.userRepository.getCountReport(reportData.postId as unknown as string)
        console.log("count",count);
        reportData.count = (count ?? 0) + 1
        
        if (post && !allReadyReported) {
            const saveReport = await this.userRepository.createReport(reportData)
            if (saveReport) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: "Reported Successfully"
                    }
                }
            }
        }
        return {
            status: 401,
            data: {
                status: false,
                message: "Post not found or report not saved"
            }
        }
    }

    async setPayment(data: Donations) {
        let amount = data.amount

        const stripeKey = process.env.STRIPE_KEY;
        if (!stripeKey) {
            throw new Error('Stripe key is not defined');
        }
        const stripe = new Stripe(stripeKey);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Donation amount",
                        },
                        unit_amount: data.amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `https://crowd-funding-hope-springs.vercel.app/postdetails/${data.beneficiaryId}`,
            cancel_url: `https://crowd-funding-hope-springs.vercel.app/postdetails/${data.beneficiaryId}`,
            
            billing_address_collection: "auto"
        });
        const amountCheck = await this.userRepository.amountReached(data.amount as number, data.beneficiaryId as any)
        let total = amountCheck?.amountRaised + data.amount
        if(total >= amountCheck.targetAmount){
            return {
                status : 400,
                data : {
                    status : false,
                    message : "Amount is greater than target amount"
                }
            }
        }
        
    
        const saveDonation = await this.userRepository.saveDonation(data)
        const updateContribution = await this.userRepository.updateContribution(data.amount as number, data.beneficiaryId as any, data.userId as string, data.method as string)
        console.log("saved");

        if (session) {
            return {
                status: 200,
                data: {
                    status: true,
                    data: session.id
                }
            }
        }
    }


    async walletPayment(data: Donations) {
        
        const checkWallet = await this.userRepository.checkWallet(data.amount as number , data.userId as string)
        if(!checkWallet){            
            return {
                status : 400,
                data : {
                    status : false,
                    message : "Insufficient balance"
                }
            }
        } 
        

        const amountCheck = await this.userRepository.amountReached(data.amount as number, data.beneficiaryId as string)
        let total = amountCheck?.amountRaised + data.amount
        if(total >= amountCheck.targetAmount){
            return {
                status : 400,
                data : {
                    status : false,
                    message : "Amount is greater than target amount"
                }
            }
        }
        
    
        const saveDonation = await this.userRepository.saveDonation(data)
        const updateContribution = await this.userRepository.updateContribution(data.amount as number, data.beneficiaryId as any, data.userId as string ,data.method as string)
        console.log("saved");
        return {
            status : 200,
            data : {
                status : true,
                message : "Payment Successfully"
            }
        }

        

    }



    async getDonations(beneficiaryId: string) {
        try {

            const donations = await this.userRepository.getDonations(beneficiaryId)

            if (donations) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: donations
                    }
                }
            }

        } catch (error) {
            console.log(error);

        }
    }



    async updateBeneficiary(content?: string, video?: string[], image?: string[], postId?: string) {
        try {
            if (image) {
                console.log("inside image", image);

                const cloudinary = await this.cloudinary.uploadMultipleimages(image as any, "updates")
                image = cloudinary
            }
            if (video) {
                console.log("inside video", video);
                const cloudinary = await this.cloudinary.uploadVideo(video as any, "updates")
                video = cloudinary as any
            }

            const updateBeneficiary = await this.userRepository.updateBeneficiary(content, video, image, postId)
            if (updateBeneficiary) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: "updated successfully"
                    }
                }
            }


        } catch (error) {
            console.log(error);
        }


    }


    async statusUpdates(postId: string) {
        try {
            const statusUpdates = await this.userRepository.getStatusUpdates(postId)
            if (statusUpdates) {
                return {
                    status: 200,
                    data: {
                        status: true,
                        data: statusUpdates
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }


    async getWallet(userId : string){
        try{
            const getWallet = await this.userRepository.getWallet(userId)
            return {
                status: 200,
                data :{
                    status: true,
                     data : getWallet
                }
            }
            
        }catch(error){
            console.log(error);
        }
    }


    async makeFundRequest(id:string){
        try{

            const makeFundRequest = await this.userRepository.makeFundRequest(id)
            if(makeFundRequest){
                return{
                    status: 200,
                     data : {
                        status : true,
                        message : "Request sent successfully"
                     }
                }

            }
        }catch(error){
            console.log(error);
            
        }
    }


}



export default UserUseCase