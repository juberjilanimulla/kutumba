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
    const client = await clientmodel.find();
    successResponse(res, "success", client);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createclientHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updateclientHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteclientHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
