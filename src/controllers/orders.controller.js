const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");

const getOrders = async (req, res) => {
  const { id } = req.params;
  const requestId = generateReqId();

  // only owner has access
  if (id !== req.user.id)
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Forbidden",
    });

  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
      select: {
        purchases: true,
      },
    });
    if (!user)
      return res.status(404).json({
        status: "error",
        code: 404,
        timestamp: new Date(),
        requestId,
        message: "User not found.",
      });

    return res.json({ status: "success", data: { data: user.purchases } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Internal server error.",
    });
  }
};

const addOrder = async (req, res) => {
  const { id } = req.params;
  const { orderId, productId, purchaseToken } = req.body;
  const requestId = generateReqId();

  if (!orderId || !productId || !purchaseToken) {
    return res.status(422).json({
      status: "error",
      code: 422,
      message: "Enter All Values",
      timestamp: new Date(),
      requestId,
    });
  }

  // only owner has access
  if (id !== req.user.id)
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Unauthorized",
      timestamp: new Date(),
      requestId,
    });

  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (!user)
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "User not found",
      timestamp: new Date(),
      requestId,
    });

  try {
    // setup
    const packageName = process.env.PACKAGE_NAME;
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;
    let resJson;
    try {
      const response = await fetch(url);
      resJson = await response.json();
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        status: "error",
        code: 500,
        message: "Internal server error.",
        timestamp: new Date(),
        requestId,
      });
    }

    if (resJson.purchaseState === 0) {
      const purchase = await db.purchase.create({
        data: {
          userId: id,
          orderId,
          productId,
          purchaseToken,
        },
      });

      return res.json({
        status: "success",
        data: {
          purchase,
        },
      });
    }

    return res.status(400).json({
      status: "error",
      code: 500,
      message: "Can't confirm purchase",
      timestamp: new Date(),
      requestId,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      timestamp: new Date(),
      requestId,
    });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId: purchaseId } = req.params;

  const purchase = await db.purchase.findUnique({
    where: {
      id: purchaseId,
    },
  });
  if (!purchase) return res.status(404).json({ error: "Purchase not found." });

  // setup
  const packageName = process.env.PACKAGE_NAME;
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${purchase.productId}/tokens/${purchase.purchaseToken}`;
  let resJson;
  try {
    const response = await fetch(url);
    resJson = await response.json();
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "Unable to complete verification.",
    });
  }

  if (resJson.purchaseState === 0) return res.json({ message: "Purchased" });
  if (resJson.purchaseState === 1 || resJson.purchaseState === 2)
    return res.status(400).json({ message: "Canceled / Pending" });
};

module.exports = {
  getOrders,
  addOrder,
};
