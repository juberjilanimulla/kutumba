import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import clientmodel from "../../models/clientmodel.js";
import eventmodel from "../../models/eventmodel.js";

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

    if (!name || !location || !phone) {
      return errorResponse(res, 400, "some params are missing");
    }
    const requiredFields = {
      categoryid,
      subcategoryid,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return errorResponse(res, 400, `${key} is missing`);
      }
    }

    // Validate category
    const existCategory = await eventmodel.findById(categoryid);
    if (!existCategory) {
      return errorResponse(res, 404, "categoryid not found");
    }

    // Validate subcategory (inside the category)
    const existSubcategory = existCategory.subcategories.id(subcategoryid);
    if (!existSubcategory) {
      return errorResponse(res, 404, "subcategory not found");
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
