const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");

const getLikedArticles = async (req, res) => {
  const { id: userId } = req.params;
  const requestId = generateReqId();
  // only logged in user should be able to retrieve data
  if (userId !== req.user.id) {
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Forbidden",
    });
  }

  try {
    const articles = await db.likedArticle.findMany({
      where: { userId },
    });

    return res.json({
      status: "success",
      data: {
        articles,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Internal server error",
    });
  }
};

const addLikedArticle = async (req, res) => {
  const { id: userId } = req.params;
  const { articleId } = req.body;

  const requestId = generateReqId();
  // only logged in user should be able to update data
  if (userId !== req.user.id) {
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Forbidden",
    });
  }

  if (!articleId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing article id",
    });
  }

  try {
    const existingArticle = await db.likedArticle.findUnique({
      where: {
        articleId,
      },
    });
    if (existingArticle) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Article Already Exist",
        timestamp: new Date(),
        request_id: requestId,
      });
    }

    const article = await db.likedArticle.create({
      data: {
        articleId,
        userId,
      },
    });

    return res.json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Internal server error",
    });
  }
};

const removeLikedArticle = async (req, res) => {
  const { id: userId } = req.params;
  const { articleId } = req.body;

  const requestId = generateReqId();
  // only logged in user should be able to update data
  if (userId !== req.user.id) {
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Forbidden",
    });
  }

  if (!articleId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing article id",
    });
  }

  try {
    await db.likedArticle.delete({
      where: {
        articleId,
      },
    });

    return res.json({
      status: "success",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getLikedArticles,
  addLikedArticle,
  removeLikedArticle,
};
