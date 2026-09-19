import {asyncHandller} from "../utils/asyncHandller.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"


export const jwtVerify=asyncHandller(async ()=>{
   try {
     const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","");
     if(!token){
         throw new ApiError(401,"Unauthorized request")
     }
     const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     const user =await User.findOne(decodeToken?._id).select("-password -refreshToken")
     
     if(!user){
         throw new ApiError(401,"Invalid access token")
     }
   } 
   catch (error) {
    throw new ApiError(404,error?.message || "Invalid access token")
   }

})