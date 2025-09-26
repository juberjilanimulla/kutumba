import { Router } from "express";
import functionmodel from "../../models/functionmodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const userfunctionRouter = Router();

userfunctionRouter.create("/post", createfunctionHandler);

export default userfunctionRouter;

async function createfunctionHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
