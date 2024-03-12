const db = require("../services/db");

const getOrders = async (req, res) => {
  const { id } = req.params;

  // only owner has access
  if (id !== req.user.id) return res.status(401).json({ error: "Invalid id." });

  const user = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      purchases: true,
    },
  });
  if (!user) return res.status(404).json({ error: "User not found." });

  return res.json({ data: user.purchases });
};

const addOrder = async (req, res) => {
  const { id } = req.params;
  const { orderId, productId, purchaseToken } = req.body;

  if (!orderId || !productId || !purchaseToken) {
    return res.status(400).json({
      error: "Missing fields",
    });
  }

  // only owner has access
  if (id !== req.user.id) return res.status(401).json({ error: "Invalid id." });

  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (!user) return res.status(404).json({ error: "User not found." });

  try {
    const purchase = await db.purchase.create({
      data: {
        userId: id,
        orderId,
        productId,
        purchaseToken,
      },
    });

    return res.json(purchase);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "Unable to add purchase",
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
  verifyOrder,
};
