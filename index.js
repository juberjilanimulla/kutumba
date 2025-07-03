import express from "express";
import config from "./config.js";
import dbConnect from "./db.js";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import { Admin, isAdminMiddleware } from "./helpers/helperFunction.js";
import authRouter from "./routes/authRouter/authRouter.js";
import adminRouter from "./routes/adminRouter/adminRouter.js";
import userRouter from "./routes/userRouter/userRouter.js";

const app = express();
const port = config.PORT;

app.set("trust proxy", true);
morgan.token("remote-addr", function (req) {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
});

morgan.token("url", (req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return req.originalUrl;
});

app.use(
  morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms"
  )
);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "10mb" }));

// Error Handling middleware for JSON parsing error
app.use((req, res, err, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON input" });
  }
  next(err);
});

//internal server error
app.use((req, res, err, next) => {
  console.log(err);
  res.status(500).json({ error: "Internal server error" });
  next();
});

//routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

//database
dbConnect()
  .then(() => {
    Admin();
    app.listen(port, () => {
      console.log(`server is listening at ${port}`);
    });
  })
  .catch(() => {
    console.log("unable to connected to server");
  });
