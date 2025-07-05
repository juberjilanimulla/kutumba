import { Router } from "express";
import userblogRouter from "./userblogRouter.js";
import usercontactRouter from "./usercontactRouter.js";

const userRouter = Router();

userRouter.use("/blog", userblogRouter);
userRouter.use("/contact", usercontactRouter);
export default userRouter;
