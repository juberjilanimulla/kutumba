import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import contactmodel from "../../models/contactmodel.js";

const admincontactRouter = Router();
admincontactRouter.get("/", getallcontactRouter);
export default admincontactRouter;

async function getallcontactRouter(req, res) {
  try {
    const contact = await contactmodel.find({ createdAt: -1 });
    successResponse(res, "success", contact);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
