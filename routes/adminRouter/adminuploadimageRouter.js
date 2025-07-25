import { Router } from "express";
import multer from "multer";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import imagemodel from "../../models/imagemodel.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// AWS S3 setup
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../temp");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(ext);
    if (isImage) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
}).array("images", 10); // up to 10 images per upload

const admingalleryimageRouter = Router();

admingalleryimageRouter.post("/create", (req, res) => {
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, 400, err.message || "Upload error");
    if (!req.files || req.files.length === 0)
      return errorResponse(res, 400, "No files uploaded");

    try {
      // Read all uploaded files and upload them to S3
      const uploadedImages = [];

      for (const file of req.files) {
        const fileContent = fs.readFileSync(file.path);
        const fileName = `${Date.now()}-${file.originalname}`;
        const s3Key = `gallery/${fileName}`;

        const s3Res = await s3
          .upload({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Body: fileContent,
            ContentType: file.mimetype,
          })
          .promise();

        uploadedImages.push({
          url: s3Res.Location,
          uploadedAt: new Date(),
        });

        fs.unlinkSync(file.path);
      }

      // Check if image document exists
      let gallery = await imagemodel.findOne();

      if (!gallery) {
        // Create new document if it doesn't exist
        gallery = new imagemodel({ images: uploadedImages });
      } else {
        // Push new images to existing document
        gallery.images.push(...uploadedImages);
      }

      await gallery.save();

      return successResponse(res, "Images uploaded successfully", gallery);
    } catch (error) {
      console.error("Upload failed:", error.message);
      req.files?.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return errorResponse(res, 500, "Image upload failed");
    }
  });
});

export default admingalleryimageRouter;
