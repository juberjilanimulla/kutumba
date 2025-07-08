import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import commentmodel from "../../models/commentmodel.js";

const usercommentRouter = Router();

usercommentRouter.post("/create", createcommentHandler);

export default usercommentRouter;

async function createcommentHandler(req, res) {
  try {
    const { blogid, name, email, mobile, message } = req.body;
    if (!blogid || !name || !email || !mobile || !message) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { blogid, name, email, mobile, message };
    const comment = await commentmodel.create(params);
    successResponse(res, "success", comment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
