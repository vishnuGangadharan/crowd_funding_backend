import { Request, Response, NextFunction } from 'express';
import UserModel from '../../infrastructure/database/userModel';
import UserUseCase from '../../useCase/userUsecase';
import OTPGenerator from '../../infrastructure/services/otpGenerator';



class UserController {
    private userUseCase: UserUseCase;
    private otpGenerator: OTPGenerator;
    constructor(userUseCase: UserUseCase){
        this.userUseCase = userUseCase;
        this.otpGenerator = new OTPGenerator();
    }

 async signup(req: Request, res: Response, next: NextFunction){
    try {
        const varifyUser = await this.userUseCase.checkAlreadyExist(req.body.email);

    
    if(varifyUser.data.status=== true){ 
        const sendOTP = await this.userUseCase.signup(
            req.body.email,
            req.body.name,
            req.body.phone,
            req.body.password
        )
        return res.status(200).send(sendOTP);

    }



   

        const newUser = new UserModel({
            name: req.body.name,
            email: req.body.email, 
            phone: req.body.phone,
            password: req.body.password,
            isBlocked: req.body.isBlocked,
            isAdmin: req.body.isAdmin,
            isGoogle: req.body.isGoogle
        });
        console.log("create", newUser);
        await newUser.save(); // Save the new user to the database

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
        console.log(error);
    }
}


}

export default UserController;