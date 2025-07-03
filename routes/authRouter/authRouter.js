import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import usermodel from "../../models/usermodel.js";
import {
  comparePassword,
  generateAccessToken,
} from "../../helpers/helperFunction.js";

const authRouter = Router();

export default authRouter;

authRouter.post("/signin", signinHandler);
authRouter.post("/forgotpassword", forgotpasswordHandler);
authRouter.post("/resetpassword", resetpasswordHandler);
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

async function forgotpasswordHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function resetpasswordHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function signupHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
