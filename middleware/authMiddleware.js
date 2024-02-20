import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;
  console.log("req.headers", req.headers);
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decode = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decode.id).select("-password");

      //   console.log(req.user, "req.user from middleware");
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error("not authorized , no Token");
  }

  if (!token) {
    res.status(401);
    throw new Error("not authorized , no Token");
  }
});

export { protect };
