
import connectToDb from "./infrastructure/config/connectDB";
import { httpServer } from './infrastructure/config/app';


const port = process.env.PORT || 3008;
const startServer = async(): Promise<void> => {
   await connectToDb();
   const app =  httpServer;
   app.listen(port,()=>{
       console.log('server running :3008');
    })
}
startServer();