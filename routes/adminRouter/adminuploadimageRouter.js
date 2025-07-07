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

// AWS S3 Setup
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer Setup
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
}).single("images");

const admingalleryimageRouter = Router();

admingalleryimageRouter.post("/:id", (req, res) => {
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, 400, err.message || "Upload error");
    if (!req.file) return errorResponse(res, 400, "No file uploaded");

    try {
      const gallery = await imagemodel.findById(req.params.id);
      if (!gallery) {
        fs.unlinkSync(req.file.path);
        return errorResponse(res, 404, "gallery not found");
      }

      const fileContent = fs.readFileSync(req.file.path);
      const fileName = `${req.params.id}-${Date.now()}${path.extname(
        req.file.originalname
      )}`;
      const s3Key = `gallery/${fileName}`;

      const s3Res = await s3
        .upload({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: s3Key,
          Body: fileContent,
          ContentType: req.file.mimetype,
        })
        .promise();

      // If blog.coverimage is an array
      //   blog.coverimage.push(s3Res.Location);

      // If blog.coverimage is a single string
      gallery.url = s3Res.Location;

      fs.unlinkSync(req.file.path);
      await gallery.save();

      return successResponse(res, "Image uploaded successfully", gallery);
    } catch (error) {
      console.error("Upload failed:", error.message);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 500, "Image upload failed");
    }
  });
});

export default admingalleryimageRouter;
