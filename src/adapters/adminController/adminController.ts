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
            const users = await this.adminUseCase.getUsers()            
            if(users){                
                return res.status(users?.status).json(users)
            }
            
            
        } catch (error) {
            console.log(error)
        }
    }


    async blockUser(req: Request, res: Response, next: NextFunction) {
        try {
            
            const userId = req.params.id
           const response = await this.adminUseCase.blockUser(userId)
            
        } catch (error) {
            console.log(error)
        }
    }
}

export default AdmiController