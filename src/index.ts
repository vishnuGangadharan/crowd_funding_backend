// import express from 'express'
// import {Request,Response} from 'express'

import connectToDb from "./infrastructure/config/connectDB";
import { httpServer } from './infrastructure/config/app';
// app.get('/', (req:Request,res:Response) => {
//     res.send('Hello World')
// })
// connectToDb();
// app.listen(3000,()=>{
//     console.log('server running');
    
// })
const startServer = async(): Promise<void> => {
   await connectToDb();
   const app =  httpServer;
   app.listen(3008,()=>{
       console.log('server running :3008');
    })
}
startServer();