import { Router } from "express";
import adminblogRouter from "./adminblogRouter.js";
import admincontactRouter from "./admincontactRouter.js";
import adminimageRouter from "./adminimageRouter.js";

const adminRouter = Router();

adminRouter.use("/blog", adminblogRouter);
adminRouter.use("/contact", admincontactRouter);
adminRouter.use("/gallery", adminimageRouter);

export default adminRouter;
