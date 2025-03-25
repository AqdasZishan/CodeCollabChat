import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default async function authmiddleware(req, res, next) {
  let token = req.headers.authorization;
  console.log(token);
  try {
    if (!token || !token.startsWith == "Bearer") {
      return res.status(404).json({
        message: "user not found",
      });
    }
    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    req.USERID = decoded.id;
    next();
  } catch (err) {
    return res.status(404).json({
      message: "user not found",
    });
  }
}
