import { Router } from "express";
import adminblogRouter from "./adminblogRouter.js";

const adminRouter = Router();

adminRouter.use("/blog", adminblogRouter);

export default adminRouter;
