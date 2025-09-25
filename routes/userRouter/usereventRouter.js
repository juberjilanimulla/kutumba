import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import eventmodel from "../../models/eventmodel.js";

const usereventRouter = Router();

usereventRouter.post("/create", createeventHandler);
usereventRouter.put("/update", updateeventHandler);

export default usereventRouter;

async function createeventHandler(req, res) {
  try {
    const { clientid, eventtype, functions } = req.body;
    if (!clientid || !eventtype || !functions) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = {
      clientid,
      eventtype,
      functions,
    };
    const event = await eventmodel.create(params);
    successResponse(res, "success", event);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updateeventHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    const options = { new: true };
    if (
      (!updatedData.clientid, !updatedData.eventtype, !updatedData.functions)
    ) {
      return errorResponse(res, 400, "some params are missing");
    }
    const event = await eventmodel.findByIdAndUpdate(_id, updatedData, options);
    successResponse(res, "success", event);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
