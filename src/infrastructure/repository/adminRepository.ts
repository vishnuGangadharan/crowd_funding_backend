import beneficiary from "../../domain/beneficiary"
import { counts, Donations } from "../../domain/donations"
import { PostReport } from "../../domain/postReport"
import AdminRepo from "../../useCase/interface/adminRepo"
import beneficiaryModel from "../database/beneficiaryModel"
import DonationModel from "../database/donationsModel"
import PostReportModel from "../database/postReportModel"
import profitModel from "../database/profitSchema"
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

    async getFundRequest(): Promise<beneficiary[] | undefined> {
        try{

            const getFundRequest = await beneficiaryModel.find({
               $or: [
                {requestedAmount:true},
                {targetDateFinished: true},
               ]

            })
            return getFundRequest

        }catch(error){
            console.log(error)
        }
    }


    async confirmFunding(id: string): Promise<boolean> {
        const confirmFunding = await beneficiaryModel.findByIdAndUpdate(id,{fundRequestConfirmed:true},{new:true})

        return confirmFunding ? true : false
    }

    async getProfit(id:string): Promise<boolean> {
        const contributedAmount = await beneficiaryModel.findById(id)
        const amount = contributedAmount?.contributedAmount || 0
        
            const profit = amount*(5/100)
        

        
        let updateProfit = await profitModel.findOne();
        if(!updateProfit){
            updateProfit = new profitModel({
                totalProfit:0,
                transactions:[]
            })
        }

        if (Array.isArray(updateProfit.transactions)) {
            updateProfit.transactions.push({
                beneficiary: id,
                amount: amount 
            })
        }
        if (updateProfit.totalProfit !== undefined) {
            updateProfit.totalProfit += profit || 0
        } else {
            updateProfit.totalProfit = profit || 0
        }

   const saved = await updateProfit.save()
        
        return false
    }

    async getDashboard(): Promise<beneficiary[]> {
          const beneficiaries = await beneficiaryModel.find({
            fundRequestConfirmed: { $ne: true },
            isApproved: 'approved',
            blocked: false
        })
        .populate('fundraiser')
        .exec();
      
        return beneficiaries;
    }


    async getDashboardCounts(): Promise<counts> {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

       
        const result = await beneficiaryModel.aggregate([
            {
              $facet: {
                totalPosts: [
                  {
                    $match: {
                      blocked: { $ne: true },
                      fundRequestConfirmed: { $ne: true },
                    }
                  },
                  { $count: 'total' }
                ],
                postsThisMonth: [
                  {
                    $match: {
                      blocked: { $ne: true },
                      fundRequestConfirmed: { $ne: true },
                      createdAt: { $gte: startOfMonth },
                    }
                  },
                  { $count: 'total' }
                ],
                completedPosts: [
                  {
                    $match: {
                      fundRequestConfirmed: true
                    }
                  },
                  { $count: 'total' }
                ],
                allPosts: [
                    {
                       $match: {
                        fundRequestConfirmed: { $ne: true },
                        isApproved: 'approved',
                        blocked: false
                       } 
                    }
                ]
              }
            }
          ]);

          const totalProfit = await profitModel.findOne({});


          
        const totalPosts = result[0]?.totalPosts[0]?.total || 0;
        const postsThisMonth = result[0]?.postsThisMonth[0]?.total || 0;
        const completedPosts = result[0]?.completedPosts[0]?.total || 0;
        const allPosts = result[0]?.allPosts || [];
        let counts: counts = {
            totalPosts,
            postsThisMonth,
            completedPosts,
            totalProfit: totalProfit || undefined,
            beneficiary: allPosts

        };
     
        console.log('Counts:', totalProfit);
        
        
        return counts;
        
    }


}
export default AdminRepository