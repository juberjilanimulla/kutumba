import { Router } from "express";
import functionmodel from "../../models/functionmodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import eventmodel from "../../models/eventmodel.js";

const userfunctionRouter = Router();

userfunctionRouter.post("/create", createfunctionHandler);

export default userfunctionRouter;

async function createfunctionHandler(req, res) {
  try {
    const {
      eventid,
      functionname,
      date,
      location,
      hall,
      guests,
      decoration,
      food,
      services,
    } = req.body;

    if (!eventid || !functionname) {
      return errorResponse(res, 400, "eventid and functionname are required");
    }
    const params = {
      eventid,
      functionname,
      date,
      location,
      hall,
      guests,
      decoration,
      food,
      services,
    };
    const func = await functionmodel.create(params);

    // Push functionId into event's functionid array
    await eventmodel.findByIdAndUpdate(
      eventid,
      { $push: { functionid: func._id } },
      { new: true }
    );
    return successResponse(res, "function created successfully", func);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
