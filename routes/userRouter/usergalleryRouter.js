import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import imagemodel from "../../models/imagemodel.js";

const usergalleryRouter = Router();

usergalleryRouter.get("/", getallgalleryHandler);

export default usergalleryRouter;

async function getallgalleryHandler(req, res) {
  try {
    const gallery = await imagemodel.find().sort({ createdAt: -1 });
    successResponse(res, "success", gallery);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
