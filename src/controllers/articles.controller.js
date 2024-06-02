const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");

const getAllArticles = async (req, res) => {
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

  const condition = {
    userId,
  };

  const { locale } = req.query;
  if (locale) condition.locale = locale;

  // pagination setup
  const resultsPerPage = 10;

  let { pageNumber } = req.query;
  if (!pageNumber) pageNumber = 1;
  pageNumber = Number(pageNumber);

  const itemsToSkip = pageNumber === 1 ? 0 : resultsPerPage * (pageNumber - 1);

  try {
    const [count, articles] = await db.$transaction([
      db.article.count({
        where: {
          ...condition,
        },
      }),
      db.article.findMany({
        where: {
          ...condition,
        },
        take: resultsPerPage,
        skip: itemsToSkip,
      }),
    ]);

    const totalPages = Math.ceil(count / resultsPerPage);

    return res.json({
      status: "success",
      data: {
        articles,
        totalPages,
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

const createArticle = async (req, res) => {
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

  const { title, body, category, imageUrl, topic, type, locale, source } =
    req.body;

  if (!title || !body || !imageUrl || !topic || !type || !locale) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing required fields.",
    });
  }

  const existingArticle = await db.article.findFirst({
    where: {
      userId,
      AND: {
        title,
      },
    },
  });
  if (existingArticle) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Article with same title already exists.",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  const articleData = { title, body, imageUrl, topic, type, locale };
  if (source) articleData.source = source;
  if (category) articleData.category = category;

  try {
    const newArticle = await db.article.create({
      data: {
        ...articleData,
        userId,
      },
    });

    return res.json({
      status: "success",
      data: {
        article: newArticle,
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

const updateArticle = async (req, res) => {
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

  const { articleId } = req.params;
  // check if a post exists with this id
  const article = await db.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!article) {
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "Invalid article id",
    });
  }

  const fieldsToUpdate = {};
  if (req.body.title) fieldsToUpdate.title = req.body.title;
  if (req.body.body) fieldsToUpdate.body = req.body.body;
  if (req.body.category) fieldsToUpdate.category = req.body.category;
  if (req.body.imageUrl) fieldsToUpdate.imageUrl = req.body.imageUrl;

  try {
    const updatedArticle = await db.article.update({
      where: { id: articleId },
      data: {
        ...fieldsToUpdate,
      },
    });
    return res.json({
      status: "success",
      data: { ...updatedArticle },
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

const deleteArticle = async (req, res) => {
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

  const { articleId } = req.params;

  // check if a post exists with this id
  const article = await db.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!article) {
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "Invalid article id",
    });
  }

  try {
    await db.article.delete({
      where: {
        id: articleId,
      },
    });
    return res.json({
      status: "success",
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Unable to delete article",
    });
  }
};

const getSingleArticle = async (req, res) => {
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

  const { articleId } = req.params;
  // check if a post exists with this id
  const article = await db.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!article) {
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "Invalid article id",
    });
  }

  try {
    const article = await db.article.findUnique({
      where: {
        id: articleId,
      },
    });
    return res.json({
      status: "success",
      data: {
        ...article,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Internal Server Error.",
    });
  }
};

module.exports = {
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getSingleArticle,
};
