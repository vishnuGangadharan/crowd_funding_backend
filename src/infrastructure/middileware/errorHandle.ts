import { Request,Response,NextFunction } from "express"

let errorHandle = async(error:Error,req:Request,res:Response,next:NextFunction)=>{

    return res.status(400).json({message:error})


}

export default errorHandle