import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

console.log("[Cloudinary] Config loaded:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "yes" : "no",
    api_key: process.env.CLOUDINARY_API_KEY ? "yes" : "no"
});

export default cloudinary;
