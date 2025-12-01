import { Router } from "express";
import subcategorymodel from "../../models/subcategorymodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const adminsubcategoryRouter = Router();
adminsubcategoryRouter.get("/", getallsubcategoryHandler);
adminsubcategoryRouter.post("/create", createsubcategoryHandler);
adminsubcategoryRouter.put("/update", updatesubcategoryHandler);
adminsubcategoryRouter.delete("/delete", deletesubcategoryHandler);

export default adminsubcategoryRouter;

async function getallsubcategoryHandler(req, res) {
  try {
    const subcategories = await subcategorymodel.find();
    successResponse(res, "success", subcategories);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
async function createsubcategoryHandler(req, res) {
  try {
    const { categoryid, name } = req.body;
    if (!categoryid || !name) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingsubcategory = await subcategorymodel.findOne({ name });
    if (existingsubcategory) {
      return errorResponse(res, 400, "subcategory already exists");
    }
    const params = { categoryid, name };
    const subcategory = await subcategorymodel.create(params);
    successResponse(res, "success", subcategory);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updatesubcategoryHandler(req, res) {
  try {
    const { _id, name } = req.body;
    if (!_id || !name) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingsubcategory = await subcategorymodel.findById({ _id });
    if (!existingsubcategory) {
      return errorResponse(res, 404, "subcategory not found");
    }
    existingsubcategory.name = name;
    await existingsubcategory.save();
    return successResponse(res, "success", existingsubcategory);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletesubcategoryHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingsubcategory = await subcategorymodel.findById({ _id });
    if (!existingsubcategory) {
      return errorResponse(res, 404, "subcategory not found");
    }
    await subcategorymodel.deleteOne({ _id });
    successResponse(res, "success");
  } catch (error) {
    console.log("error", error);
  }
}
