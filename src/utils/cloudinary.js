import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
    });

    const uploadOnCloudinary=async (localFilePath)=>{
        try {
            if(!localFilePath) return null
            //upload to cloud
            const response=await cloudinary.uploader.upload(localFilePath,
                {
                    resource_type:"auto"
                }
            )
            //upload success
            // console.log("file uploaded successfully",response.url )
            //as success unlink files from server
            fs.unlinkSync(localFilePath)
            return response
        } catch (error) {
            fs.unlinkSync(localFilePath)//remove the file from server as upload failed, used sync as first complete this op then only proceed
            return null;
        }
    }

    export {uploadOnCloudinary}