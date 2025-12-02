// backend/utils/generateToken.js
import crypto from "crypto";

const generateSessionToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

export { generateSessionToken };
