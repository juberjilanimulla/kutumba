import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import commentmodel from "../../models/commentmodel.js";
import blogmodel from "../../models/blogmodel.js";

const usercommentRouter = Router();

usercommentRouter.post("/create", createcommentHandler);

usercommentRouter.get("/", getcommentHandler);

export default usercommentRouter;

async function createcommentHandler(req, res) {
  try {
    const { blogid, name, email, mobile, message } = req.body;
    if (!blogid || !name || !email || !mobile || !message) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingblog = await blogmodel.findById({ _id: blogid });
    if (!existingblog) {
      return errorResponse(res, 404, "blog not found");
    }
    const params = { blogid, name, email, mobile, message };
    const comment = await commentmodel.create(params);
    successResponse(res, "success", comment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getcommentHandler(req, res) {
  try {
    const comment = await commentmodel.find({ approved: true });
    successResponse(res, "success", comment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
