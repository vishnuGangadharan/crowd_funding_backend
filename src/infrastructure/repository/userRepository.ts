import User from "../../domain/users";
import UserRepo from "../../useCase/interface/userRepo";
import UserModel from "../database/userModel";
import OTPModel from "../database/otpModel";
import beneficiaryModel from "../database/beneficiaryModel";
import beneficiary from "../../domain/beneficiary";
import { emit } from "process";
import { comments } from "../../domain/comment";
import commentModel from "../database/commentModel";
import { PostReport } from "../../domain/postReport";
import PostReportModel from "../database/postReportModel";
import { Donations } from "../../domain/donations";
import DonationModel from "../database/donationsModel";
import updateModel from "../database/beneficiaryUpdateModel";
import { updates } from "../../domain/interface";
class UserRepository implements UserRepo {


    async findByEmail(email: string): Promise<User | null> {
        const userData = await UserModel.findOne({ email });

        return userData
    }

    async saveOTP(otp: number, email: string, name?: string, phone?: string, password?: string,): Promise<any> {
        const otpDoc = new OTPModel({
            email,
            name,
            phone,
            password,
            otp,
            otpGeneratedAt: new Date(),
            otpExpiredAt: new Date(Date.now() + 1000 * 60 * 60)
        })

        const saveDoc = await otpDoc.save()
        return saveDoc;
    }

    async findOtpByEmail(email: string): Promise<any> {
        const otpData = await OTPModel.findOne({ email }).sort({ otpGeneratedAt: -1 })

        return otpData
    }

    async deleteOtpByEmail(email: string): Promise<any> {

        return OTPModel.deleteOne({ email })
    }

    async save(user: User): Promise<User> {
        const newUser = new UserModel(user)
        const savedUser = await newUser.save();
        return savedUser;
    }

    async verifyBeneficiary(email: string): Promise<any> {
        const existBeneficiary = await beneficiaryModel.findOne({ email });
        return existBeneficiary
    }



    async createFundraiser(beneficiary: beneficiary, fundraiser: string): Promise<beneficiary> {

        const newBeneficiary = new beneficiaryModel({
            ...beneficiary,
            fundraiser: fundraiser,
            medicalDetails: {}
        });
        const savedBeneficiary = await newBeneficiary.save();
        return savedBeneficiary.toObject();
    }

    async updateFundraiser(userId: string): Promise<Boolean> {
        const updateAsFundraiser= await UserModel.findByIdAndUpdate(
            userId,
            {$set : { isFundraiser : true}},
            {new: true}
        );
        return !!updateAsFundraiser
    }

    async getBeneficiaries(userId: string): Promise<any> {
        const beneficiaries = await beneficiaryModel.find({ fundraiser: userId });
        return beneficiaries;
    }


    async editProfile(user: { name?: string, email?: string, phone?: string, profilePicture?: string }): Promise<any> {

        const updateUser = await UserModel.updateOne(
            { email: user.email },
            { $set: { name: user.name, phone: user.phone, email: user.email, profilePicture: user.profilePicture } })
        return updateUser.modifiedCount > 0
    }


    async findById(id: string): Promise<User | null> {
        const userData = await UserModel.findById(id).exec()
        return userData
    }

    async getPostDetailsById(userId: string): Promise<beneficiary | null> {
        const postData = await beneficiaryModel.findById(userId).populate('fundraiser').exec()
        return postData

    }

    async createComment(comment: string, userId: string, postId: string, userName: string): Promise<comments> {
        const newComment = new commentModel({
            comment,
            userId,
            postId,
            userName,
        });
        const savedComment = await newComment.save();
        return savedComment.toObject();
    }


    async getComments(id: string): Promise<comments[]> {
        const comments = await commentModel.find({ postId: id }).lean().sort({ createdAt: -1 }).exec();
        return comments
    }

    async getAllPost(): Promise<beneficiary[]> {
        const posts = await beneficiaryModel.find(
            { isApproved: "approved",
              blocked :false
             }
        ).populate('fundraiser').exec();
        return posts;
    }

    async updatePassword(password: string, userId: string): Promise<User | null> {
        const update = await UserModel.findByIdAndUpdate(
            { _id: userId },
            { $set: { password: password } },
            { new: true }
        )

        return update
    }


    async findPostById(postId: string): Promise<beneficiary | null> {
        const postExists = await beneficiaryModel.findById(postId)
        return postExists
    }

    async createReport(reportData: PostReport): Promise<PostReport | boolean> {
        console.log("report",reportData);
        
        const newReport = new PostReportModel(reportData)
        const saveReport = await newReport.save();
        return saveReport
    }

    async saveDonation(donationData: Donations): Promise<Donations> {

        const newDonation = new DonationModel(donationData)
        const saveDonation = await newDonation.save();
        return saveDonation

    }

    async amountReached(amount: number, beneficiaryId: string): Promise<{ targetAmount: number, amountRaised: number }> {
        try {
            const reachedTarget = await beneficiaryModel.findById(beneficiaryId);
        
            if (reachedTarget && reachedTarget.amount !== undefined) {
                const data = {
                    targetAmount: reachedTarget.amount || 0,
                    amountRaised: reachedTarget.contributedAmount || 0
                };
                console.log('dddddd',data);
                

                return data;
            }

          return {
                targetAmount: 0,
                amountRaised: 0
            };
        } catch (error) {
            console.error('Error fetching beneficiary amounts:', error);
            throw error;
        }
    }



    async getDonations(beneficiaryId: string): Promise<Donations[]> {
        const donations = await DonationModel.find({ beneficiaryId: beneficiaryId }).populate('userId').exec();

        return donations;
    }

    async updateContribution(amount: number, beneficiaryId: string): Promise<boolean> {
        try {
          
            const numericAmount = Number(amount);

            if (isNaN(numericAmount)) {
                throw new Error('Invalid amount value');
            }

            const updateAmount = await beneficiaryModel.updateOne(
                { _id: beneficiaryId },
                { $inc: { contributedAmount: numericAmount } }
            );

            return updateAmount.modifiedCount > 0;
        } catch (error) {
            console.error('Error updating contribution:', error);
            return false;
        }
    }

    async findReport(userId: string): Promise<PostReport | null> {
        const existUserReport = await PostReportModel.findOne({ userId });
        return existUserReport;
    }


    async getCountReport(postId: string): Promise<number | null> {
        
        const count = await PostReportModel.countDocuments({postId})        
        return count 
    }


    async updateBeneficiary(content?: string, video?: string[], image?: string[], postId?: string): Promise<boolean> {
        try {
            const savedUpdate = new updateModel({
                postId: postId,
                content: content,
                video: video,
                image: image,
            })
            const update = await savedUpdate.save();
            return update ? true : false;
        } catch (error) {
            console.error('Error updating beneficiary:', error);
            return false;
        }
    }

    async getStatusUpdates(postId: string): Promise<updates[] | null> {
        const statusUpdates = await updateModel.find({ postId: postId });
        return statusUpdates;
    }
}

export default UserRepository