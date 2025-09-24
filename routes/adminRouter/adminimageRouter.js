import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import imagemodel from "../../models/imagemodel.js";
import admingalleryimageRouter from "./adminuploadimageRouter.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const adminimageRouter = Router();

adminimageRouter.get("/", getallimageHandler);
adminimageRouter.use("/", admingalleryimageRouter);
adminimageRouter.delete("/imagedelete", deletegalleryimageHandler);
adminimageRouter.delete("/delete", deletegalleryHandler);

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
  if (!s3Key) {
    return errorResponse(res, 400, "Invalid S3 URL");
  }

  try {
    // 1. Fetch the gallery document
    const gallery = await imagemodel.findById(galleryid);
    if (!gallery) return errorResponse(res, 404, "Gallery not found");

    // 2. Check if imageurl exists in gallery.images
    const imageExists = gallery.images.some(
      (img) =>
        decodeURIComponent(img.url.trim()) ===
        decodeURIComponent(imageurl.trim())
    );

    if (!imageExists) {
      return errorResponse(res, 404, "Image URL not found in gallery");
    }

    // AWS SDK v3 delete
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
      })
    );

    // 4. Remove image from DB
    gallery.images = gallery.images.filter(
      (img) =>
        decodeURIComponent(img.url.trim()) !==
        decodeURIComponent(imageurl.trim())
    );

    await gallery.save();

    return successResponse(res, "Image deleted successfully");
  } catch (error) {
    console.error("Image deletion failed:", error.message);
    return errorResponse(res, 500, "Internal server error");
  }
}

async function deletegalleryHandler(req, res) {
  try {
    const { _id } = req.body;

    if (!_id) {
      return errorResponse(res, 400, "gallery ID (_id) is required");
    }

    // 1. Find the gallery document
    const gallery = await imagemodel.findById(_id);
    if (!gallery) {
      return errorResponse(res, 404, "Gallery not found");
    }

    if (Array.isArray(gallery.images) && gallery.images.length > 0) {
      for (const img of gallery.images) {
        const s3Key = img.url.split(".amazonaws.com/")[1];
        if (s3Key) {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: s3Key,
            })
          );
        }
      }
    }

    await imagemodel.findByIdAndDelete(_id);

    return successResponse(res, "Gallery and its images deleted successfully");
  } catch (error) {
    console.error("Gallery delete error:", error.message);
    return errorResponse(res, 500, "Internal server error");
  }
}
