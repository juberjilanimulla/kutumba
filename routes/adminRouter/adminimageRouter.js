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
  const { imageid, galleryid } = req.body;

  if (!imageid || !galleryid) {
    return errorResponse(res, 400, "Missing image ID or gallery ID");
  }

  try {
    // 1. Fetch the gallery document
    const gallery = await imagemodel.findById(galleryid);
    if (!gallery) return errorResponse(res, 404, "Gallery not found");

    // 2. Find the image by _id inside gallery.images
    const imageDoc = gallery.images.id(imageid);
    if (!imageDoc) {
      return errorResponse(res, 404, "Image not found in gallery");
    }
    // 3. Extract S3 key from the image URL
    const s3Key = imageDoc.url.split(".amazonaws.com/")[1];
    if (!s3Key) {
      return errorResponse(res, 400, "Invalid S3 URL stored in DB");
    }

    // 4. Delete from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      })
    );

    // 5. Remove image from gallery.images
    imageDoc.deleteOne(); // mongoose subdoc method
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
              Bucket: process.env.AWS_BUCKET_NAME,
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
