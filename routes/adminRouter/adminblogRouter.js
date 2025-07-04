import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import blogmodel from "../../models/blogmodel.js";
import adminblogimageRouter from "./adminuploadblogimageRouter.js";
import AWS from "aws-sdk";

const s3 = new AWS.S3();

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
    const { title, metatitle, metadescription, keywords, content, published } =
      req.body;
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

    // Find blog before deletion
    const blog = await blogmodel.findById(_id);
    if (!blog) {
      return errorResponse(res, 404, "blog not found");
    }

    // Delete the single image from S3 if present
    if (blog.coverimage) {
      const s3Key = blog.coverimage.split(".amazonaws.com/")[1];
      if (s3Key) {
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
          })
          .promise();
      }
    }

    // Delete the blog from MongoDB
    await blogmodel.findByIdAndDelete(_id);

    return successResponse(
      res,
      "Blog and its cover image deleted successfully"
    );
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
  const { imageurl, blogid } = req.body;
  if (!imageurl || !blogid) {
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
    const blog = await blogmodel.findById(blogid);
    if (!blog) return errorResponse(res, 404, "blog not found");

    if (
      decodeURIComponent(blog.coverimage.trim()) ===
      decodeURIComponent(imageurl.trim())
    ) {
      blog.coverimage = ""; // or null
    }

    await blog.save();

    // 3. Refetch updated document
    const updated = await blogmodel.findById(blogid);

    return successResponse(res, "Image deleted successfully", updated);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
