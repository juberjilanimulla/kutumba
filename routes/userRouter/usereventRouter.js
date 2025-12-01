import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import eventmodel from "../../models/eventmodel.js";

const usereventRouter = Router();

usereventRouter.get("/category", getallcategoryHandler);
usereventRouter.post("/subcategories", getallsubcategoryHandler);

export default usereventRouter;

async function getallcategoryHandler(req, res) {
  try {
    const categories = await eventmodel.find({}, { category: 1 });
    successResponse(res, "categories successfully", categories);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getallsubcategoryHandler(req, res) {
  try {
    const { categoryid } = req.body;

    if (!categoryid) {
      return errorResponse(res, 400, "categoryid is required");
    }

    const category = await eventmodel.findById(categoryid, {
      subcategories: 1,
      category: 1,
    });

    if (!category) {
      return errorResponse(res, 404, "category not found");
    }

    successResponse(res, "subcategories successfully", {
      category: category.category,
      subcategories: category.subcategories,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
