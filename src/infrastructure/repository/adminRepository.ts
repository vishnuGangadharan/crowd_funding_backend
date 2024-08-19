import beneficiary from "../../domain/beneficiary"
import { Donations } from "../../domain/donations"
import { PostReport } from "../../domain/postReport"
import AdminRepo from "../../useCase/interface/adminRepo"
import beneficiaryModel from "../database/beneficiaryModel"
import DonationModel from "../database/donationsModel"
import PostReportModel from "../database/postReportModel"
import UserModel from "../database/userModel"
import walletModel from "../database/wallet"

class AdminRepository implements AdminRepo{

   async findAllUsers(page:number, limit:number, searchTerm: string){
    const skip = (page-1) * limit
    const query = searchTerm?
        {
            isAdmin:false,$or:[
                {name:{$regex:searchTerm,$options:'i'}},
                {email:{$regex:searchTerm,$options:'i'}}
            ]
        }
        :{ isAdmin:false}
       const users = await UserModel.find(query).skip(skip).limit(limit).lean()
       const total = await UserModel.countDocuments(query)
       return {users, total}
   }
   async findByIdAndUpdate(id:string,status:boolean):Promise<boolean>{
       const user = await UserModel.findByIdAndUpdate(id,{isBlocked:status},{new:true})
       return user ? true : false
}

    async getRequest(){
       const request = await beneficiaryModel.find({})
       return request

    }

    async updateStatus(postId: string, status: string): Promise<beneficiary | null> {
        const update = await beneficiaryModel.findByIdAndUpdate(postId,{isApproved:status},{new: true})
        return update
    }

    async getallReports(): Promise<PostReport[] | null> {
        const allReport = await PostReportModel.find({}).populate('postId').exec()        
        return allReport

    }

    async getPostDetailsById(userId: string): Promise<beneficiary | null> {
        const postData = await beneficiaryModel.findById(userId).populate('fundraiser').exec() 
        return postData
        
    }

    async blockPost(postId: string): Promise<beneficiary | null> {
        const blockPost = await beneficiaryModel.findByIdAndUpdate(postId,{blocked:true},{new:true})
        return blockPost 
    }


    async refundAllDonations(postId: string): Promise<boolean | null> {
        try {
            const donations = await DonationModel.find({beneficiaryId:postId})
        
            if(donations && donations.length > 0){
                
                for(const donation of donations){
                    let wallet = await walletModel.findOne({userId: donation.userId})
                    console.log("walllettt",wallet);
                    
                    if(!wallet){
                       wallet = new walletModel({
                        userId : donation.userId,
                        balance:0,
                        transactions:[]
                       })
                       console.log(`Created new wallet for userId: ${donation.userId}`);

                    } 
                        wallet.transactions.push({
                            beneficiary: donation.beneficiaryId,
                            amount:donation.amount,
                            type:'credit',
                            description: `Refund for blocked beneficiary campaign of `
                        })
                        wallet.balance += donation.amount
                    
                    const savedWallet = await wallet?.save();
                                console.log('Wallet saved successfully:', savedWallet);

                }
            }
        
            return donations? true :false
        } catch(error) {
            console.log(error)
            return null
        }
    }
    
    async deleteDonations(postId: string): Promise<void> {
        await DonationModel.deleteMany({beneficiaryId:postId})
        await beneficiaryModel.findByIdAndUpdate(postId,{contributedAmount:0})
    }

}
export default AdminRepository