import { Router } from "express";
import userblogRouter from "./userblogRouter.js";
import usercontactRouter from "./usercontactRouter.js";
import usergalleryRouter from "./usergalleryRouter.js";
import usercommentRouter from "./usercommentRouter.js";
import userclientRouter from "./userclientRouter.js";
import userfunctionRouter from "./userfunctionRouter.js";
import userprivacypolicyRouter from "./userprivacypolicyRouter.js";
import usertermandconditionRouter from "./usertermsandconditionRouter.js";
import usercategeoryRouter from "./usercategoryRouter.js";

const userRouter = Router();

userRouter.use("/blog", userblogRouter);
userRouter.use("/contact", usercontactRouter);
userRouter.use("/gallery", usergalleryRouter);
userRouter.use("/comment", usercommentRouter);
userRouter.use("/client", userclientRouter);
userRouter.use("/category", usercategeoryRouter);
userRouter.use("/function", userfunctionRouter);
userRouter.use("/privacypolicy", userprivacypolicyRouter);
userRouter.use("/termsandcondition", usertermandconditionRouter);

export default userRouter;
