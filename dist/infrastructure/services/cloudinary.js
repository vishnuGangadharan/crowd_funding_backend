"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: "dfzpyl4bi",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class Cloudinary {
    uploadImage(image, folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("cloud");
                const uploadResult = yield cloudinary_1.v2.uploader
                    .upload(image, {
                    folder: `${folderName}`,
                    resource_type: 'image'
                });
                console.log("dddddddd", uploadResult);
                return uploadResult.secure_url;
            }
            catch (error) {
                console.error("Error uploading image to cloudinary", error);
                throw error;
            }
        });
    }
    uploadMultipleimages(images, folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadPromises = images.map((image) => __awaiter(this, void 0, void 0, function* () {
                    const uploadResult = yield cloudinary_1.v2.uploader.upload(image, {
                        folder: folderName,
                        resource_type: 'image'
                    });
                    return uploadResult.secure_url;
                }));
                const uploadedUrls = yield Promise.all(uploadPromises);
                return uploadedUrls;
            }
            catch (error) {
                console.error("Error uploading image to cloudinary", error);
                throw error;
            }
        });
    }
    uploadVideo(video, folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the input is an array (multiple videos)
                if (Array.isArray(video)) {
                    // Handle multiple video uploads
                    const uploadPromises = video.map((singleVideo) => __awaiter(this, void 0, void 0, function* () {
                        const uploadResult = yield cloudinary_1.v2.uploader.upload(singleVideo, {
                            folder: `${folderName}`,
                            resource_type: 'video',
                        });
                        return uploadResult.secure_url;
                    }));
                    const uploadedUrls = yield Promise.all(uploadPromises);
                    return uploadedUrls; // Return an array of URLs
                }
                else {
                    // Handle single video upload
                    const uploadResult = yield cloudinary_1.v2.uploader.upload(video, {
                        folder: `${folderName}`,
                        resource_type: 'video',
                    });
                    return uploadResult.secure_url; // Return a single URL
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error uploading video to Cloudinary", error.message);
                }
                else {
                    console.error("Error uploading video to Cloudinary", String(error));
                }
                throw error;
            }
        });
    }
    uploadSingleVideo(video, folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadResult = yield cloudinary_1.v2.uploader.upload(video, {
                    folder: `${folderName}`,
                    resource_type: 'video',
                });
                return uploadResult.secure_url;
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error uploading single video to Cloudinary", error.message);
                }
                else {
                    console.error("Error uploading single video to Cloudinary", String(error));
                }
                throw error;
            }
        });
    }
    uploadAudio(audio, folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadResult = yield cloudinary_1.v2.uploader.upload(audio, {
                    folder: `${folderName}`,
                    resource_type: 'raw',
                });
                return uploadResult.secure_url;
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error uploading audio to cloudinary", error.message);
                }
                else {
                    console.error("Error uploading audio to cloudinary", String(error));
                }
                throw error;
            }
        });
    }
}
exports.default = Cloudinary;
