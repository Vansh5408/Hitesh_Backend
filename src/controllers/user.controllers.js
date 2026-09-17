import {asyncHandller} from "../utils/asyncHandller.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandller(async (req,res)=>{
    /*res.status(200).json({
        message:"ok"
    })*/

    const {fullname,email,username,password}=req.body;

    if(
        [fullname,email,username,password].some((fields)=>
        fields?.trim()===""
    ) ){
        throw new ApiError(400,"All fields are required")
    }


    const existedUser=await User.findOne({
        $or:[{username},{email}]
    }
    )

    if(existedUser){
        throw new ApiError(409,"user already exist")
    }

    const avtarLocalPath = req.files?.avtar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avtarLocalPath){
        throw new ApiError(400,"avtar is required")
    }

    const avtar=await uploadOnCloudinary(avtarLocalPath);
    const image = await  uploadOnCloudinary(coverImageLocalPath)

    if(!avtar){
        throw new ApiError(400,"avtar is required")
    }

   const user =await User.create({
        fullname,
        email,
        password,
        avtar:avtar.url,
        coverImage:image?.url || "",
        username:username.toLowerCase()
    })

    // select work here when we select the user not get user password and refreshtoken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something user is defined before in here")
    }

    return res.status(200).json(
         new ApiResponse(201,createdUser,"UserCreated")
    )


})

export  {registerUser}