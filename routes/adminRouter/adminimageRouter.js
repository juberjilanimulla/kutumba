import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import imagemodel from "../../models/imagemodel.js";
import admingalleryimageRouter from "./adminuploadimageRouter.js";
import AWS from "aws-sdk";

const s3 = new AWS.S3();

const adminimageRouter = Router();

adminimageRouter.get("/", getallimageHandler);
adminimageRouter.use("/", admingalleryimageRouter);
adminimageRouter.delete("/delete", deletegalleryimageHandler);

export default adminimageRouter;

async function getallimageHandler(req, res) {
  try {
    const imageurl = await imagemodel.find().sort({ createdAt: -1 });
    successResponse(res, "success", imageurl);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error ");
  }
}

async function deletegalleryimageHandler(req, res) {
  const { imageurl, galleryid } = req.body;

  if (!imageurl || !galleryid) {
    return errorResponse(res, 400, "Missing image URL or gallery ID");
  }

  const s3Key = imageurl.split(".amazonaws.com/")[1];
  console.log("s3Key", s3Key);
  if (!s3Key) {
    return errorResponse(res, 400, "Invalid S3 URL");
  }

  try {
    // 1. Delete image from S3
    await s3
      .deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
      })
      .promise();

    // 2. Remove the image from the images array in the document
    const gallery = await imagemodel.findById(galleryid);
    if (!gallery) return errorResponse(res, 404, "Gallery not found");

    const filteredImages = gallery.images.filter(
      (img) =>
        decodeURIComponent(img.url.trim()) !==
        decodeURIComponent(imageurl.trim())
    );

    gallery.images = filteredImages;
    await gallery.save();

    return successResponse(res, "Image deleted successfully");
  } catch (error) {
    console.error("Image deletion failed:", error.message);
    return errorResponse(res, 500, "Internal server error");
  }
}
