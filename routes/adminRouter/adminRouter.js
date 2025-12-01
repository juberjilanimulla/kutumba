import { Router } from "express";
import adminblogRouter from "./adminblogRouter.js";
import admincontactRouter from "./admincontactRouter.js";
import adminimageRouter from "./adminimageRouter.js";
import admincommentRouter from "./admincommentRouter.js";
import adminclientRouter from "./adminclientRouter.js";
import adminfunctionRouter from "./adminfunctionRouter.js";
import adminprivacypolicyRouter from "./adminprivacypolicyRouter.js";
import admintermsandconditionRouter from "./admintermsandconditionRouter.js";
import admincategoryRouter from "./admincategoryRouter.js";
import adminsubcategoryRouter from "./adminsubcategoryRouter.js";

const adminRouter = Router();

adminRouter.use("/blog", adminblogRouter);
adminRouter.use("/contact", admincontactRouter);
adminRouter.use("/gallery", adminimageRouter);
adminRouter.use("/comment", admincommentRouter);
adminRouter.use("/client", adminclientRouter);
adminRouter.use("/function", adminfunctionRouter);
adminRouter.use("/privacypolicy", adminprivacypolicyRouter);
adminRouter.use("/termsandcondition", admintermsandconditionRouter);
adminRouter.use("/category", admincategoryRouter);
adminRouter.use("/subcategory", adminsubcategoryRouter);
export default adminRouter;
