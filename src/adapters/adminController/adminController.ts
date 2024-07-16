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


   
}

export default AdmiController