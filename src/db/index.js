import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"
const connectDb= async()=>{
    try{
       const url= await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       console.log(`\n Mongo connect ${url.connection.host}`);
    }
    catch(error){
        console.log("Error :",error);
        process.exit(1);
    }
}
export default connectDb;
