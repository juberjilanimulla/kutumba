import { Router } from "express";
import privacypolicymodel from "../../models/privacypolicymodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const userprivacypolicyRouter = Router();

userprivacypolicyRouter.get("/", getprivacypolicyHandler);

export default userprivacypolicyRouter;

async function getprivacypolicyHandler(req, res) {
  try {
    const privacypolicy = await privacypolicymodel.find();
    successResponse(res, "success", privacypolicy);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
