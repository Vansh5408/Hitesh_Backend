import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"

const app = express();
app.use(cors({
    origin:process.env.CORS_PORT,
    credentials:true
}))
//because we get the json data  so we use this middleware
app.use(express.json({limit:"16kb"}));
// because data come from urls 
app.use(express.urlencoded({extended:true}));
// because we store the assests like photos pdf 
app.use(express.static("public"));
// for cookie configration
app.use(cookieparser());

 import userRouter from "./routes/user.router.js"

 app.use('/api/v1/user',userRouter);

export {app} 