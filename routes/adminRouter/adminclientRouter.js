import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import clientmodel from "../../models/clientmodel.js";

const adminclientRouter = Router();

adminclientRouter.post("/", getallclientHnadler);
adminclientRouter.post("/create", createclientHandler);
adminclientRouter.put("/update", updateclientHandler);
adminclientRouter.delete("/delete", deleteclientHandler);

export default adminclientRouter;

async function getallclientHnadler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = {};

    // Apply search
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { notes: { $regex: searchRegex } },
      ];
    }

    // Apply filters
    if (filterBy && Object.keys(filterBy).length > 0) {
      query = {
        ...query,
        ...filterBy,
      };
    }

    // Sorting logic
    const sortBy =
      Object.keys(sortby).length !== 0
        ? Object.keys(sortby).reduce((acc, key) => {
            acc[key] = sortby[key] === "asc" ? 1 : -1;
            return acc;
          }, {})
        : { createdAt: -1 };

    // Fetch paginated blogs
    const client = await clientmodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalCount = await clientmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    successResponse(res, "successfully", {
      client,
      totalPages,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

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

async function updateclientHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    const options = { new: true };
    if (
      !updatedData.name ||
      !updatedData.location ||
      !updatedData.phone ||
      !updatedData.altphone ||
      !updatedData.email ||
      !updatedData.notes
    ) {
      return errorResponse(res, 400, "some params are missing");
    }
    const client = await clientmodel.findByIdAndUpdate(
      _id,
      updatedData,
      options
    );
    successResponse(res, "success update", client);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteclientHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingclient = await clientmodel.findById(_id);
    if (!existingclient) {
      return errorResponse(res, 404, "client not found");
    }
    const client = await clientmodel.findByIdAndDelete({ _id: _id });
    successResponse(res, "success");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
