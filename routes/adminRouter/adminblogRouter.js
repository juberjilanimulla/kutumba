import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import blogmodel from "../../models/blogmodel.js";
import adminblogimageRouter from "./adminuploadblogimageRouter.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const adminblogRouter = Router();

adminblogRouter.post("/", getallblogHandler);
adminblogRouter.post("/create", createblogHandler);
adminblogRouter.put("/update", updateblogHandler);
adminblogRouter.delete("/delete", deleteblogHandler);
adminblogRouter.post("/published", publishedapprovalHandler);
adminblogRouter.delete("/deleteimage", deletecoverimageHandler);
adminblogRouter.use("/uploadimage", adminblogimageRouter);

export default adminblogRouter;

async function getallblogHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = {};

    // Apply search
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: { $regex: searchRegex } },
        { metadescription: { $regex: searchRegex } },
        { keywords: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
      ];
    }

    // Apply filters
    if (filterBy && Object.keys(filterBy).length > 0) {
      query = {
        ...query,
        ...filterBy,
      };
    }

    // Sorting logic
    const sortBy =
      Object.keys(sortby).length !== 0
        ? Object.keys(sortby).reduce((acc, key) => {
            acc[key] = sortby[key] === "asc" ? 1 : -1;
            return acc;
          }, {})
        : { createdAt: -1 };

    // Fetch paginated blogs
    const blogs = await blogmodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalCount = await blogmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    successResponse(res, "successfully", {
      blogs,
      totalPages,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createblogHandler(req, res) {
  try {
    const {
      title,
      metatitle,
      metadescription,
      keywords,
      content,
      published,
      author,
    } = req.body;
    if (!title || !metatitle || !metadescription || !keywords || !content) {
      return errorResponse(res, 400, "some params are missing");
    }
    const parmas = {
      title,
      metatitle,
      metadescription,
      keywords,
      content,
      published: true,
      author,
    };
    const blog = await blogmodel.create(parmas);
    successResponse(res, "successfully updated", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updateblogHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    const options = { new: true };
    if (
      !updatedData.title ||
      !updatedData.metatitle ||
      !updatedData.metadescription ||
      !updatedData.keywords ||
      !updatedData.content
    ) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const blog = await blogmodel.findByIdAndUpdate(_id, updatedData, options);
    successResponse(res, "successfully updated", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteblogHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "blog ID (_id) is required");
    }

    // Find property before deletion (to access images)
    const blog = await blogmodel.findById(_id);
    if (!blog) {
      return errorResponse(res, 404, "blog not found");
    }

    // Delete all images from S3
    const s3Key = blog.coverimage?.split(".amazonaws.com/")[1];

    if (s3Key) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
        })
      );
    }

    // Delete blog from DB
    await blogmodel.findByIdAndDelete(_id);

    return successResponse(res, "blog and associated images deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error ");
  }
}

async function publishedapprovalHandler(req, res) {
  try {
    const { publishedid, published } = req.body;

    if (typeof published !== "boolean") {
      return errorResponse(
        res,
        400,
        "published must be a boolean (true/false)"
      );
    }

    const updatedBlog = await blogmodel.findByIdAndUpdate(
      publishedid,
      { published },
      { new: true }
    );

    if (!updatedBlog) {
      return errorResponse(res, 404, "Blog not found");
    }

    return successResponse(
      res,
      "Blog approval status updated successfully",
      updatedBlog
    );
  } catch (error) {
    console.error("Error updating blog:", error);
    return errorResponse(res, 500, "Internal server error");
  }
}

async function deletecoverimageHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "Blog ID (_id) is required");
    }

    const blog = await blogmodel.findById(_id);
    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    const imageUrl = blog.coverimage;
    const s3Key = imageUrl?.split(".amazonaws.com/")[1];

    if (s3Key) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      });
      await s3.send(deleteCommand);
    }

    blog.coverimage = ""; // Clear image reference from DB
    await blog.save();

    return successResponse(res, "Blog image deleted successfully", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
