import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import termandconditionmodel from "../../models/termsandconditionmodel.js";
const usertermandconditionRouter = Router();

usertermandconditionRouter.get("/", gettermsandconditionHandler);

export default usertermandconditionRouter;

async function gettermsandconditionHandler(req, res) {
  try {
    const data = await termandconditionmodel.find().sort({ version: -1 });
    successResponse(res, "success", data);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error ");
  }
}
