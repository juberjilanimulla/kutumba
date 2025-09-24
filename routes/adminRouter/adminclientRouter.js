import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import clientmodel from "../../models/clientmodel.js";

const adminclientRouter = Router();

adminclientRouter.post("/", getallclientHnadler);

export default adminclientRouter;

async function getallclientHnadler(req, res) {
  try {
    const client = await clientmodel.find();
    successResponse(res, "success", client);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
