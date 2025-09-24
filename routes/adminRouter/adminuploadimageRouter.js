import { Router } from "express";
import multer from "multer";
import fs, { createReadStream } from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import imagemodel from "../../models/imagemodel.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
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
      const uploadedImages = [];

      for (const file of req.files) {
        const fileStream = createReadStream(file.path);
        const fileName = `${Date.now()}-${file.originalname}`;
        const s3Key = `gallery/${fileName}`;

        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME, // <-- make sure this is correct
          Key: s3Key,
          Body: fileStream,
          ContentType: file.mimetype,
        });

        await s3.send(command);

        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        uploadedImages.push({
          url: imageUrl,
          uploadedAt: new Date(),
        });

        fs.unlinkSync(file.path); // cleanup local file
      }

      // Check if gallery already exists
      let gallery = await imagemodel.findOne();

      if (!gallery) {
        gallery = new imagemodel({ images: uploadedImages });
      } else {
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
