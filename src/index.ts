
import connectToDb from "./infrastructure/config/connectDB";
import { httpServer } from './infrastructure/config/app';

const startServer = async(): Promise<void> => {
   await connectToDb();
   const app =  httpServer;
   app.listen(3008,()=>{
       console.log('server running :3008');
    })
}
startServer();