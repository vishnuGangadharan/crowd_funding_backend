import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import cloudinaryI from '../../useCase/interface/cloundinaryRepo';



dotenv.config();
cloudinary.config({
    cloud_name: "dfzpyl4bi",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});


 class Cloudinary implements cloudinaryI{
    async uploadImage(image: any, folderName: string): Promise<string> {
        try{
            console.log("cloud");
            
            const uploadResult = await cloudinary.uploader
            .upload(
                image,{
                    folder:`${folderName}`,
                    resource_type:'image'
                }
                
            )
            console.log("dddddddd",uploadResult);
            
            return uploadResult.secure_url
        }catch (error) {
            console.error("Error uploading image to cloudinary",error);
            throw error
            
        }
    }

    async uploadMultipleimages(images:[], folderName:string){
        try{
            const uploadPromises = images.map(async (image)=>{
                const uploadResult = await cloudinary.uploader.upload(image, {
                    folder: folderName,
                    resource_type: 'image'
                });
                return uploadResult.secure_url
            })

            const uploadedUrls = await Promise.all(uploadPromises);
            return uploadedUrls;

        }catch (error) {
            console.error("Error uploading image to cloudinary",error);
            throw error
        }
    }


    async uploadVideo(video: any, folderName: string): Promise<string | string[]> {
        try {
          // Check if the input is an array (multiple videos)
          if (Array.isArray(video)) {
            // Handle multiple video uploads
            const uploadPromises = video.map(async (singleVideo) => {
              const uploadResult = await cloudinary.uploader.upload(singleVideo, {
                folder: `${folderName}`,
                resource_type: 'video',
              });
              return uploadResult.secure_url;
            });
            const uploadedUrls = await Promise.all(uploadPromises);
            return uploadedUrls; // Return an array of URLs
          } else {
            // Handle single video upload
            const uploadResult = await cloudinary.uploader.upload(video, {
              folder: `${folderName}`,
              resource_type: 'video',
            });
            return uploadResult.secure_url; // Return a single URL
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error uploading video to Cloudinary", error.message);
          } else {
            console.error("Error uploading video to Cloudinary", String(error));
          }
          throw error;
        }
      }



      async uploadSingleVideo(video: any, folderName: string): Promise<string> {
        try {
          const uploadResult = await cloudinary.uploader.upload(video, {
            folder: `${folderName}`,
            resource_type: 'video',
          });
          return uploadResult.secure_url; 
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error uploading single video to Cloudinary", error.message);
          } else {
            console.error("Error uploading single video to Cloudinary", String(error));
          }
          throw error;
        }
      }


      async uploadAudio(audio: any, folderName: string): Promise<string>{
        try{
           const uploadResult = await cloudinary.uploader.upload(audio, {
            folder: `${folderName}`,
            resource_type: 'raw',
           })
           return uploadResult.secure_url
        }catch(error: unknown){
            if(error instanceof Error){
                console.error("Error uploading audio to cloudinary", error.message);
            }else{
                console.error("Error uploading audio to cloudinary", String(error));
            }
            throw error
        }
      }

 }


 export default Cloudinary