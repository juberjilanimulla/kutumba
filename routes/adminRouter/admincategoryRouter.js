import { Router } from "express";
import categorymodel from "../../models/categorymodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const admincategoryRouter = Router();

admincategoryRouter.get("/", getallcategoryHandler);
admincategoryRouter.post("/create", createcategoryHandler);
admincategoryRouter.put("/update", updatecategoryHandler);
admincategoryRouter.delete("/delete", deletecategoryHandler);

export default admincategoryRouter;

async function getallcategoryHandler(req, res) {
  try {
    const categories = await categorymodel.find();
    successResponse(res, "success", categories);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createcategoryHandler(req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingcategory = await categorymodel.findOne({ name });
    if (existingcategory) {
      return errorResponse(res, 400, "category already exists");
    }
    const category = await categorymodel.create({ name });
    successResponse(res, "success", category);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updatecategoryHandler(req, res) {
  try {
    const { categoryid, name } = req.body;
    if (!categoryid || !name) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingcategory = await categorymodel.findById({ _id: categoryid });
    if (!existingcategory) {
      return errorResponse(res, 404, "category not found");
    }
    existingcategory.name = name;
    await existingcategory.save();
    successResponse(res, "success", existingcategory);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletecategoryHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingcategory = await categorymodel.findById({ _id });
    if (!existingcategory) {
      return errorResponse(res, 404, "category not found");
    }
    await categorymodel.findByIdAndDelete({ _id });
    successResponse(res, "success");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
