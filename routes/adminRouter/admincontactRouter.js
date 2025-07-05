import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import contactmodel from "../../models/contactmodel.js";

const admincontactRouter = Router();
admincontactRouter.get("/", getallcontactRouter);
admincontactRouter.delete("/delete", deletecontactRouter);
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

async function deletecontactRouter(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const contact = await contactmodel.findByIdAndDelete({ _id });
    successResponse(res, "success");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
