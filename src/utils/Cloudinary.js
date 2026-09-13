import { v2 as cloudinary } from 'cloudinary';
import fs from"fs";

cloudinary.config({ 
        cloud_name:process.env.CLOUDIANRY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async (localFile)=>{
    try{
        if(!localFile) return null
        const response=await cloudinary.uploader.upload(localFile,{
            resource_type:"auto"
        });
        console.log("file is upload in cloudinary",response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFile);
        return null;

    }
}

export{uploadOnCloudinary}    