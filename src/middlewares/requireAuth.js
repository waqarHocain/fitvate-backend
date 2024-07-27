const jwt = require("jsonwebtoken");

const db = require("../services/db");

async function requireAuth(req, res, next) {
  const header = req.headers["authorization"];
  const accessToken = header ? header.split(" ")[1] : null;
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
      // check if the user exists in database
      const user = await db.user.findUnique({
        where: {
          id: decoded.id,
        },
      });
      if (!user) {
        return res.status(403).json({
          status: "error",
          code: 403,
          timestamp: new Date(),
          message: "Forbidden.",
        });
      }

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
