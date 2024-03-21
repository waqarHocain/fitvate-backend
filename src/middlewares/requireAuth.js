const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers["authorization"];
  const accessToken = header.split(" ")[1];
  if (!accessToken)
    return res.status(401).json({
      status: "error",
      code: 401,
      timestamp: new Date(),
      message: "Access Token Missing.",
    });

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    if (decoded) {
      req.user = { id: decoded.id, email: decoded.email };
      next();
    }
  } catch (e) {
    return res.status(401).json({
      status: "error",
      code: 401,
      timestamp: new Date(),
      message: "Unauthorized.",
    });
  }
}

module.exports = {
  requireAuth,
};
