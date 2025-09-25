import { Router } from "express";
import userblogRouter from "./userblogRouter.js";
import usercontactRouter from "./usercontactRouter.js";
import usergalleryRouter from "./usergalleryRouter.js";
import usercommentRouter from "./usercommentRouter.js";
import userclientRouter from "./userclientRouter.js";

const userRouter = Router();

userRouter.use("/blog", userblogRouter);
userRouter.use("/contact", usercontactRouter);
userRouter.use("/gallery", usergalleryRouter);
userRouter.use("/comment", usercommentRouter);
userRouter.use("/client", userclientRouter);
export default userRouter;
