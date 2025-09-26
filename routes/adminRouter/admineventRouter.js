import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import eventmodel from "../../models/eventmodel.js";

const admineventRouter = Router();

admineventRouter.post("/category/create", createcategoryeventHandler);
admineventRouter.post("/subcategory/create", createsubcategoryeventHandler);
admineventRouter.get("/category", getallcategoryHandler);
admineventRouter.post("/subcategories", getallsubcategoriesHandler);
admineventRouter.put("/update/category", updatecategoryHandler);
admineventRouter.put("/update/subcategories", updatesubcategoriesHandler);
admineventRouter.delete("/delete/category", deletecategoryHandler);
admineventRouter.delete("/delete/subcategory", deletesubcategoryHandler);

export default admineventRouter;

async function createcategoryeventHandler(req, res) {
  try {
    const { category } = req.body;
    if (!category) {
      return errorResponse(res, 400, "some params are missing");
    }
    const event = await eventmodel.create({ category });
    successResponse(res, "success", event);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createsubcategoryeventHandler(req, res) {
  try {
    const { categoryid, name } = req.body;

    if (!categoryid || !name) {
      return errorResponse(res, 400, "categoryid and name are required");
    }

    const event = await eventmodel.findByIdAndUpdate(
      categoryid,
      { $push: { subcategories: { name } } }, //
      { new: true } //
    );

    if (!event) {
      return errorResponse(res, 404, "Category not found");
    }

    successResponse(res, "subcategory added successfully", event);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getallcategoryHandler(req, res) {
  try {
    const categories = await eventmodel.find({}, { category: 1 });
    successResponse(res, "categories successfully", categories);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getallsubcategoriesHandler(req, res) {
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

async function updatecategoryHandler(req, res) {
  try {
    const { categoryid, category } = req.body;

    if (!categoryid || !category) {
      return errorResponse(res, 400, "categoryid and category are required");
    }

    const updatedcategory = await eventmodel.findByIdAndUpdate(
      categoryid,
      { category },
      { new: true }
    );

    if (!updatedcategory) {
      return errorResponse(res, 404, "category not found");
    }

    successResponse(res, "updated successfully", updatedcategory);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updatesubcategoriesHandler(req, res) {
  try {
    const { categoryid, subcategoryid, name } = req.body;

    if (!categoryid || !subcategoryid || !name) {
      return errorResponse(
        res,
        400,
        "categoryid, subcategoryid and name are required"
      );
    }

    const updatedCategory = await eventmodel.findOneAndUpdate(
      { _id: categoryid, "subcategories._id": subcategoryid },
      { $set: { "subcategories.$.name": name } },
      { new: true }
    );

    if (!updatedCategory) {
      return errorResponse(res, 404, "Subcategory not found");
    }

    successResponse(res, "subcategory updated successfully", updatedCategory);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletecategoryHandler(req, res) {
  try {
    const { categoryid } = req.body;

    if (!categoryid) {
      return errorResponse(res, 400, "categoryid is required");
    }

    const deletedCategory = await eventmodel.findByIdAndDelete(categoryid);

    if (!deletedCategory) {
      return errorResponse(res, 404, "Category not found");
    }

    successResponse(res, "category deleted successfully");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletesubcategoryHandler(req, res) {
  try {
    const { categoryid, subcategoryid } = req.body;

    if (!categoryid || !subcategoryid) {
      return errorResponse(
        res,
        400,
        "categoryid and subcategoryid are required"
      );
    }

    const updatedCategory = await eventmodel.findByIdAndUpdate(
      categoryid,
      { $pull: { subcategories: { _id: subcategoryid } } },
      { new: true }
    );

    if (!updatedCategory) {
      return errorResponse(res, 404, "Subcategory not found");
    }

    successResponse(res, "subcategory deleted successfully");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
