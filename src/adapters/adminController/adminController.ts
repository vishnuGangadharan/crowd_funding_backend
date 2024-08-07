import { Request, Response, NextFunction } from 'express';
import AdminUseCase from '../../useCase/adminUsecase';


class AdmiController {
    private adminUseCase: AdminUseCase;

    constructor(
        adminUseCase: AdminUseCase
    ){
        this.adminUseCase = adminUseCase
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {      
            const page = parseInt(req.query.page as string)|| 1
            const limit = parseInt(req.query.limit as string) || 5
            const searchTerm = req.query.searchTerm as string || ''  
                
            const users = await this.adminUseCase.getUsers(page, limit, searchTerm)            
            if(users){                
                return res.status(users?.status).json(users)
            }
            
            
        } catch (error) {
            console.log(error)
        }
    }


    async blockStatusUpdate(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const { status } = req.body;
            const response = await this.adminUseCase.handleBlockStatus(userId, status);
            if (response && response.status) {
                
                return res.status(response.status).json(response);
            } else {
                return res.status(500).json({ error: 'Invalid response' });
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    }


    async getRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const request = await this.adminUseCase.getRequest();
            if (request) {
                return res.status(request.status).json(request);
            } else {
                return res.status(500).json({ error: 'Invalid response' });
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    }


    async postApproval(req : Request, res: Response, next: NextFunction){
        try{
          const {postId , status} = req.body;
          console.log(req.body); 
            const response = await this.adminUseCase.approvalPost(postId, status)
            console.log("ddd",response);
            if(response){
                return res.status(response.status).json(response.data)
            }
        }catch(error){
            console.log(error);
            next(error)
            
        }
    }


    async getAllReports(req: Request, res: Response, next: NextFunction) {
        try {
            const allReports = await this.adminUseCase.allReports();
            if (allReports && allReports.status) {
                return res.status(allReports.status).json(allReports.data);
            } else {
                return res.status(500).json({ error: 'Invalid response' });
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    }


    async getPostDetails(req:Request,res:Response,next:NextFunction){
        const userId = req.query.postId
        
        const response = await this.adminUseCase.getPostDetails(userId as string)
        if(response){
            return res.status(response?.status).json(response.data)
        }
        
    }


   
}

export default AdmiController