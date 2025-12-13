import jwt from "jsonwebtoken";

export const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const verifyToken = (token, secret) =>
  jwt.verify(token, secret);
