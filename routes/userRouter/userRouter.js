import { Router } from "express";
import userblogRouter from "./userblogRouter.js";

const userRouter = Router();

userRouter.use("/blog", userblogRouter);

export default userRouter;
