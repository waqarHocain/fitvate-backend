const jwt = require("jsonwebtoken");

const generateToken = (userId, isRefreshToken = false) => {
  const secretKey = isRefreshToken
    ? process.env.JWT_REFRESH_SECRET
    : process.env.JWT_SECRET;

  const expiry = isRefreshToken ? "90d" : "24h";

  const token = jwt.sign(
    {
      id: userId,
    },
    secretKey,
    { expiresIn: expiry }
  );
  return token;
};

module.exports = { generateToken };
