import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import cloudinaryI from '../../useCase/interface/cloundinaryRepo';



dotenv.config();
cloudinary.config({
    cloud_name: "dqz0q5xvu",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

 class Cloudinary implements cloudinaryI{
    async uploadImage(image: any, folderName: string): Promise<string> {
        try{
            const uploadResult = await cloudinary.uploader
            .upload(
                image,{
                    folder:`${folderName}`,
                    resource_type:'image'
                }
                
            )
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

 }


 export default Cloudinary