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
    const {
      name,
      location,
      phone,
      altphone,
      email,
      notes,
      categoryid,
      subcategoryid,
    } = req.body;
    if (
      !name ||
      !location ||
      !phone ||
      !altphone ||
      !email ||
      !notes ||
      !categoryid ||
      !subcategoryid
    ) {
      return errorResponse(res, 400, "some params are missing");
    }
    const requiredFields = {
      name,
      location,
      phone,
      altphone,
      email,
      notes,
      categoryid,
      subcategoryid,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return errorResponse(res, 400, `${key} is missing`);
      }
    }
    const params = {
      name,
      location,
      phone,
      altphone,
      email,
      notes,
      categoryid,
      subcategoryid,
    };
    const client = await clientmodel.create(params);
    successResponse(res, "success", client);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
