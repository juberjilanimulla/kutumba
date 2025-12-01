import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import usermodel from "../../models/usermodel.js";
import {
  bcryptPassword,
  comparePassword,
  generateAccessToken,
} from "../../helpers/helperFunction.js";

const authRouter = Router();

export default authRouter;

authRouter.post("/signin", signinHandler);
authRouter.post("/signup", signupHandler);

async function signinHandler(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 400, "some params are missing");
    }
    const users = await usermodel.findOne({ email });

    if (!users) {
      return errorResponse(res, 404, "Email does not exist");
    }
    const comparepassword = comparePassword(password, users.password);

    if (!comparepassword) {
      return errorResponse(res, 404, "Invalid Password");
    }
    const userid = users._id.toString();

    const { encoded_token, public_token } = generateAccessToken(
      userid,
      users.email,
      users.role,
      users.firstname
    );

    successResponse(res, "SignIn successfully", {
      encoded_token,
      public_token,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function signupHandler(req, res) {
  try {
    const { firstname, lastname, email, mobile, password } = req.body;
    if (!firstname || !lastname || !email || !mobile || !password) {
      return errorResponse(res, 400, "some params are missing");
    }
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashedPassword = bcryptPassword(password);

    const user = await usermodel.create({
      firstname,
      lastname,
      email,
      mobile,
      password: hashedPassword,
    });
    successResponse(res, "signup successfully", user);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
