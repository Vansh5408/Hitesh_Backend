//require('dotenv').config({path:'./env'});


import dotenv from "dotenv";
import connectDb from "./db/index.js";
dotenv.config({path:'./.env'});

// when we use async and await its return promise so we use .then and .catch 
connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server run in ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Error :",err);
})





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