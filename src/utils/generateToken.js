const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const token = jwt.sign(
    {
      expiresIn: "12h",
      id: userId,
    },
    process.env.JWT_SECRET
  );
  return token;
};

module.exports = { generateToken };
