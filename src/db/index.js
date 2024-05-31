import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
    try{
        const connecctionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n connected!! DB HOST: ${connecctionInstance.connection.host}`);
    }
    catch(error){
        console.log("mongo error",error)
        process.exit(1)
    }
}
export default connectDB