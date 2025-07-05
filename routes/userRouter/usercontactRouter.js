import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import contactmodel from "../../models/contactmodel.js";

const usercontactRouter = Router();

usercontactRouter.post("/create", createcontactHandler);

export default usercontactRouter;

async function createcontactHandler(req, res) {
  try {
    const { firstname, lastname, email, mobile, description } = req.body;
    if (!firstname || !lastname || !email || !mobile || !description) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { firstname, lastname, email, mobile, description };
    const contact = await contactmodel.create(params);
    successResponse(res, "success", contact);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
