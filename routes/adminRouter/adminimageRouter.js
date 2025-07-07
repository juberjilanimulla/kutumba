import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import imagemodel from "../../models/imagemodel.js";
import admingalleryimageRouter from "./adminuploadimageRouter.js";

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
    return errorResponse(res, 400, "some params are missing");
  }
  const s3Key = imageurl.split(".amazonaws.com/")[1];
  if (!s3Key) {
    return errorResponse(res, 400, "invalid s3 url");
  }
  try {
    await s3
      .deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: s3Key })
      .promise();
    // 2. Remove from DB
    const gallery = await imagemodel.findById(galleryid);
    if (!gallery) return errorResponse(res, 404, "gallery not found");

    if (
      decodeURIComponent(gallery.url.trim()) ===
      decodeURIComponent(imageurl.trim())
    ) {
      gallery.url = ""; // or null
    }

    await gallery.save();

    // 3. Refetch updated document
    const updated = await imagemodel.findById(galleryid);

    return successResponse(res, "Image deleted successfully", updated);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
