import { Request, Response, NextFunction } from 'express';
import UserUseCase from '../../useCase/userUsecase';
import User from '../../domain/users';
import beneficiary from '../../domain/beneficiary';
import { PasswordData } from '../../domain/interface';
import { Donations } from '../../domain/donations';


interface MulterFiles {
    profilePics: Express.Multer.File[];
    supportingDocs: Express.Multer.File[];
}

class UserController {
    private userUseCase: UserUseCase;
    constructor(userUseCase: UserUseCase) {
        this.userUseCase = userUseCase;
    }

    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("req.body", req.body);

            const verifyUser = await this.userUseCase.checkAlreadyExist(req.body.email);

            if (verifyUser.data.status === true && req.body.isGoogle) {
                const user = await this.userUseCase.verifyOtpUser(req.body)

                return res.status(user.status).json(user.data)

            }


            if (verifyUser.data.status === true) {
                const sendOTP = await this.userUseCase.signup(
                    req.body.email,
                    req.body.name,
                    req.body.phone,
                    req.body.password,
                    req.body.isGoogle,
                )
                return res.status(sendOTP.status).json(sendOTP.data);

            } else {
                return res.status(verifyUser.status).json(verifyUser.data)
            }
        } catch (error) {
            next(error);
            console.log(error);
        }
    }


    async verifyOTP(req: Request, res: Response, next: NextFunction) {
        try {

            const { otp, email } = req.body;
            console.log("otp", otp, "email", email);

            let verify = await this.userUseCase.verifyOtp(email, otp)
            if (verify.status == 400) {
                return res.status(verify.status).json({ message: verify.message });
            } else if (verify.status == 200) {
                let save = await this.userUseCase.verifyOtpUser(verify.data)
                if (save) {
                    return res.status(save.status).json(save);
                }
            }

        } catch (error) {
            next(error);
        }
    }


    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const user = await this.userUseCase.login(email, password);
            if (user) {

                return res.status(user.status).cookie('jwt', user.data.token).json(user.data);
            }
        }
        catch (error) {
            next(error);
        }
    }



    async editProfile(req: Request, res: Response, next: NextFunction) {
        try {

            const { name, email, phone } = req.body;
            const user = { name, email, phone }
            const filePath = req.file?.path


            const updateUser = await this.userUseCase.editProfile(user as User, filePath as string);
            if (updateUser) {
                return res.status(updateUser.status).json(updateUser.data)
            }
        }
        catch (error) {
            next(error);
        }
    }


    async sendOtpForBeneficiary(req: Request, res: Response, next: NextFunction) {
        try {
            const checkForExisting = await this.userUseCase.findBeneficiary(req.body)

            return res.status(checkForExisting.status).json(checkForExisting.data)

        } catch (error) {
            next(error)
        }
    }

    async verifyOtpBeneficiary(req: Request, res: Response, next: NextFunction) {
        try {

            const { otp, email } = req.body;
            let verify = await this.userUseCase.verifyOtp(email, otp)

            return res.status(verify.status).json(verify.message)


        } catch (error) {
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


            const { category, ...rest } = beneficiariesJson;
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
            console.log("final", beneficiaryData);


            //inside     


            const fundraiserEmail = beneficiaryData.currentUserEmail;
            let supportingDocsPath = supportingDocs.map((val) => val.path);
            const profilePicPath = profilePic.map((val) => val.path)

            const register = await this.userUseCase.fundRegister(beneficiaryData, fundraiserEmail, supportingDocsPath, profilePicPath);

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
            if (allBeneficiaries) {
                return res.status(allBeneficiaries.status).json(allBeneficiaries.data);
            }
        }
        catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.query.userId as string;
        const user = await this.userUseCase.userDetails(userId)

        if (user) {
            return res.status(user?.status).json(user?.data)
        }
    }

    async getPostDetails(req: Request, res: Response, next: NextFunction) {
        const userId = req.query.postId

        const response = await this.userUseCase.getPostDetails(userId as string)
        if (response) {
            return res.status(response?.status).json(response.data)
        }

    }


    async addComment(req: Request, res: Response, next: NextFunction) {
        const { comment, postId, userId } = req.body;
        const saveComment = await this.userUseCase.addComment(comment, postId, userId);
        if (saveComment) {
            return res.status(saveComment.status).json(saveComment.data)
        }

    }


    async getComments(req: Request, res: Response, next: NextFunction) {
        const { id } = req.query;
        const comments = await this.userUseCase.getComments(id as string)
        if (comments) {
            return res.status(comments.status).json(comments.data)
        }

    }

    async getAllPost(req: Request, res: Response, next: NextFunction) {
        const { page, searchTerm, category } = req.query;
        const limit = 3;
        const skip = (Number(page) - 1) * limit;
        

        const posts = await this.userUseCase.allPost(searchTerm as string,skip,limit, category as string);

        if (posts) {
            return res.status(posts.status).json(posts.data);
        }
    }


    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;


            const { currentPassword, newPassword, confirmPassword } = req.body;
            const data = { currentPassword, newPassword, confirmPassword };
            const changePassword = await this.userUseCase.updatePassword(data as PasswordData, userId as string);
            if (changePassword) {
                res.status(changePassword?.status).json(changePassword?.data)
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred while updating the password' });
        }
    }


    async reportPost(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, postId, reason, comment } = req.body;
            const file = req.file;
            const reportData = {
                userId,
                postId,
                reason,
                comment,
                image: file ? file.path : null,
                
            };


            const report = await this.userUseCase.reportPost(reportData);
            if (report) {
                return res.status(report.status).json(report.data)
            }
        } catch (error) {
            next(error);
        }
    }



    async setPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { amount, anonymousName, userId, beneficiaryId, method } = req.body;
            const paymentData = {
                amount,
                anonymousName,
                userId,
                beneficiaryId,
                method
            };

            const response = await this.userUseCase.setPayment(paymentData as Donations);

            if (response) {
                return res.status(response.status).json(response.data);
            }
        } catch (error) {
            next(error);
        }
    }


    async walletPayment(req: Request, res: Response, next: NextFunction) {
        try{
            const { amount, anonymousName, userId, beneficiaryId, method } = req.body;
            const paymentData = {
                amount,
                anonymousName,
                userId,
                beneficiaryId,
                method
            };

            const response = await this.userUseCase.walletPayment(paymentData as Donations);
            if(response){
                return res.status(response.status).json(response.data);
            }
            
        }catch(error){
            next(error);
        }
    }


    async getDonations(req: Request, res: Response, next: NextFunction) {
        try {

            const beneficiaryId = req.query.beneficiaryId as string;
            const getDonations = await this.userUseCase.getDonations(beneficiaryId);
            if (getDonations) {
                return res.status(getDonations.status).json(getDonations.data);
            }

        } catch (error) {
            console.log(error);
            next(error);

        }
    }


    async updateBeneficiary(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("heree", req.body);

            const { content, postId } = req.body;
            const video = (req.files as { [fieldname: string]: Express.Multer.File[] })?.videosUpdate;
            const image = (req.files as { [fieldname: string]: Express.Multer.File[] })?.imagesUpdate;

            let videoPath: string[] = [];
            if (video) {
                videoPath = video.map((file) => file.path);
                console.log("videoPath", videoPath);
            }

            // Handle image files
            let imagePath: string[] = [];
            if (image) {
                imagePath = image.map((file) => file.path);
                console.log("imagePath", imagePath);
            }
            const response = await this.userUseCase.updateBeneficiary(content, videoPath, imagePath, postId);
            if (response) {
                return res.status(response.status).json(response.data);
            }

        } catch (error) {
            next(error);
        }
    }

    async getStatusUpdates(req:Request, res: Response, next: NextFunction) {
        try { 
           const postId = req.query.postID as string;
           const response = await this.userUseCase.statusUpdates(postId)
           if(response){
            return res.status(response.status).json(response.data)
           }
        } catch (error) {
            next(error);
        }
    }
 

    async getWallet(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.query.userId as string;
            console.log('userId', userId);
            
            const response = await this.userUseCase.getWallet(userId);
            if(response){
                return res.status(response.status).json(response.data)
            }
            
        } catch (error) {
            next(error);
        }
    }

    async makeRequestForFund(req: Request, res: Response, next: NextFunction){
        try{
            const {id} = req.body 
            const makeFundRequest = await this.userUseCase.makeFundRequest(id)
            if(makeFundRequest){
                return res.status(makeFundRequest.status).json(makeFundRequest.data)
            }
        }catch(error){
            next(error);
        }
    }


}
export default UserController;