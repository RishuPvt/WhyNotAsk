import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, resource_type = "image") => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resource_type,
    });
    if (response) {
      fs.unlinkSync(localFilePath);
    }
    //console.log(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteOnCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      throw new Error("Cloudinary deletion unsuccessful");
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error.message || error);
    throw new Error("Error while deleting the avatar on Cloudinary");
  }
};

export { uploadOnCloudinary ,deleteOnCloudinary };
