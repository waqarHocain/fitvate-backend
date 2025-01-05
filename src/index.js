const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const morgan = require("morgan");

// local imports
const { connectRedis } = require("./services/redis");
const authRouter = require("./routes/auth.js");
const userRouter = require("./routes/user");
const analyticsRouter = require("./routes/analytics");
const { requireAuth } = require("./middlewares/requireAuth");
const { dailyActiveUsers } = require("./middlewares/dau");

const app = express();

// connect to redis server
connectRedis();

// logger
app.use(morgan("tiny"));

// Bodyparser Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));

// public route handlers
app.use("/auth", authRouter);

// protected route handlers
app.use("/users", requireAuth, dailyActiveUsers, userRouter);
app.use("/analytics", requireAuth, dailyActiveUsers, analyticsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
