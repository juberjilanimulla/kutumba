import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import clientmodel from "../../models/clientmodel.js";

const userclientRouter = Router();

userclientRouter.post("/create", createclientHandler);

export default userclientRouter;

async function createclientHandler(req, res) {
  try {
    const { name, location, phone, altphone, email, notes } = req.body;
    if (!name || !location || !phone || !altphone || !email || !notes) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = {
      name,
      location,
      phone,
      altphone,
      email,
      notes,
    };
    const client = await clientmodel.create(params);
    successResponse(res, "success", client);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
