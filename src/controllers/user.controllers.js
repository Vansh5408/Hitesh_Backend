import {asyncHandller} from "../utils/asyncHandller.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

// make this method for generate access token and refresh token

const generateAccessandRefreshToken=async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accesstoken= user.generateAccessToken();
        const refershtoken= user.generateRefreshToken();
        user.refreshToken=refreshtoken;
        // those not effect on other data of user or password
        await user.save({validateBeforSave:false});
        return {accesstoken,refershtoken};
        
    }
    catch{
        throw new ApiError(500,"something wrong in generate  access token and refresh token")
    }
}


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

const loginUser=asyncHandller(async (req,res)=>{

    // req body data access
    const {username,email,password}=req.body;
    if(!(username || email)){
        throw new ApiError(404,"email or username is  required");
    }

    // username and email find
    const user =await User.findOne({
        $or:[{email,username}]
    })

    // find user 
    if(!user){
        throw new ApiError(404,"user is not exist")
    }

    // password check
    const isValid= await User.isPasswordCorrect(password);

    if(!isValid){
        throw new ApiError(404,"password is not valid")
    }

    // access and refresh token 

    const {refershtoken,accesstoken}=await generateAccessandRefreshToken(user._id);

    const loggedInUser = await User.findOne(user._id).select("-password -refershToken")

 
    const options ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accesstoken,options)
    .cookie("RefreshToken",refershtoken,options)
    .json(
        new ApiResponse(200,
            {
                user:loggedInUser,accesstoken,refershtoken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser=asyncHandller(async (req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refershToken:undefined
            }
        },
        {
            new :true
        }
)

    const options ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",accesstoken,options)
    .clearCookie("RefreshToken",refershtoken,options)
    .json(new ApiResponse(200,{},"User logout successfully"))
})

const refreshAccessToken= asyncHandller(async(req,res)=>{
    const incomingtoken = req.cookies.refrefreshToken || req.body.refreshToken;
    if(!incomingtoken){
        throw new ApiError(401,"unauthorized");
    }
    try {
        const decodedToken = jwt.verify(incomingtoken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"user not verified");
        }
    
        if(incomingtoken!=user?.refershToken){
            throw new ApiError(401,"invalid refresh token")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        const {accesstoken,refreshtoken}=await generateAccessandRefreshToken(user._id);
    
        return res.status(200).cookie("accessToken",accesstoken,options).cookie("refershtoken",refreshtoken,options)
        .json(new ApiResponse(200,{accesstoken,refreshtoken},"access token refreshed"))
    } catch (error) {
        throw new ApiError(401,"unauthorized")
    }
})


const passwordChange=asyncHandller(async  (req,res)=>{
    const{oldPassword,newPassword}=req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"incorrect password")
    }
    user.password=newPassword;
    await user.save({validateBeforSave:false});

    return res.status(200).json( new ApiResponse(200,{},"password changed successfully"));

})

const getCurrentUser=asyncHandller(async (req,res)=>{
    return res.status(200).json(200,req.user,"current user fatched successfully")
})

const updateAccountDetails= asyncHandller(async (req,res)=>{
    const {fullname,email}= req.body;
    if(!fullname || !email){
        throw new ApiError(401,"required fullname or email");
    }

    const user= await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullname,
                email:email
            },
        },
            {
                new:true
            }
        
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"successfully update values"))
})

const updateUserAvtar=asyncHandller(async(req,res)=>{
    const avtarLocalPath=req.file?.path;

    if(!avtarLocalPath){
        throw new ApiError(400,"avtar local path not found");
    }

    const avtarupdate=await uploadOnCloudinary(avtarLocalPath);

    if(!avtarupdate.url){
        throw new ApiError(400,"error while  uploading on avtar");
    }

   const user= await User.findByIdAndUpdate(req.user?._id,{
        $set :{
            avtar:avtarupdate.url
        }
    },{
        new :true
    }).select("-password");

    return res.status(200).json(new ApiResponse(200,user,"avtar image upload"))
})

const updateUserImage=asyncHandller(async (req,res)=>{
    const coverImageLocalPath=req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(401,"cover image required");
    }

    const updateImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!updateImage.url){
        throw new ApiError(400,"image not upload on cloud")
    }

    const user =User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:updateImage.url
        }
    },{
        new :true
    }).select("-password");

    return res.status(200).json(new ApiResponse(200,user,"cover image update successfully"))
})

export  {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    passwordChange,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvtar,
    updateUserImage

}