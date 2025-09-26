import { Router } from "express";
import adminblogRouter from "./adminblogRouter.js";
import admincontactRouter from "./admincontactRouter.js";
import adminimageRouter from "./adminimageRouter.js";
import admincommentRouter from "./admincommentRouter.js";
import adminclientRouter from "./adminclientRouter.js";
import admineventRouter from "./admineventRouter.js";
import adminfunctionRouter from "./adminfunctionRouter.js";

const adminRouter = Router();

adminRouter.use("/blog", adminblogRouter);
adminRouter.use("/contact", admincontactRouter);
adminRouter.use("/gallery", adminimageRouter);
adminRouter.use("/comment", admincommentRouter);
adminRouter.use("/client", adminclientRouter);
adminRouter.use("/event", admineventRouter);
adminRouter.use("/function", adminfunctionRouter);

export default adminRouter;
