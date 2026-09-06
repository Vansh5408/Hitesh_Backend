//require('dotenv').config({path:'./env'});


import dotenv from "dotenv";
import connectDb from "./db/index.js";
dotenv.config({path:'./.env'});


connectDb();





/*
import mongoose from "mongoose"
import {DB_NAME} from "./constant.js"
import express from "express"
const app = express();
;(async ()=>{
    try{
        await  mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
               app.on("error",(error)=>{
                console.log("ERR :",error);
                throw error 
               })

               app.listen(process.env.PORT,()=>{
                console.log(`App listen in ${process.env.PORT}`);
               })
    }
    catch{
        console.error("Error :", error)
        throw err
    }
})()
    */