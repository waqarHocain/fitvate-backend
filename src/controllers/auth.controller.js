const db = require("../services/db");
const { generateToken } = require("../utils/generateToken");

const googleAuth = async (req, res) => {
  // provided an idToken, verifies it from Google server and create / retrieves user
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "Id token is missing." });

  const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;

  try {
    const response = await fetch(googleUrl);
    if (response.status !== 200)
      return res.status(400).json({
        error: "Invalid token",
      });

    const json = await response.json();
    try {
      const user = await db.user.findUnique({
        where: {
          googleId: json.sub,
        },
      });
      if (user) {
        delete user.password;
        const token = generateToken(user.id);
        return res.json({ user, token });
      }
      const newUser = await db.user.create({
        data: {
          name: json.name,
          email: json.email,
          profilePic: json.picture,
          googleId: json.sub,
          provider: "google",
        },
      });
      const token = generateToken(newUser.id);
      return res.json({ user: newUser, token });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to connect to db." });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to verify token" });
  }
};

const facebookAuth = async (req, res) => {
  /* verify provided input_token with facebook server, if it is valid then creates / retrieves the user profile.
  - https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow#checktoken
  - https://developers.facebook.com/docs/graph-api/overview/#fields
  */
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "Id token is missing." });

  const appId = process.env.FACEBOOK_CLIENT_ID;
  const appSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const verifyUrl = `"https://graph.facebook.com/debug_token?input_token=${idToken}&access_token=${appId}|${appSecret}`;

  try {
    const response = await fetch(verifyUrl);
    const json = await response.json();
    const userId = json.data.user_id;
    if (json.data.app_id !== appId || !userId)
      return res.status(400).json({ error: "Invalid id token." });

    // check if user already exists
    const user = await db.user.findUnique({
      where: {
        facebookId: userId,
      },
    });
    if (user) {
      const token = generateToken(user.id);
      delete user.password;
      return res.json({ user, token });
    }

    // fetch and create a new user
    const profile = await fetch(
      `https://graph.facebook.com/${userId}?fields=id,name,email,picture&access_token=${appId}|${appSecret}`
    );
    const profileJson = await profile.json();
    const newUser = await db.user.create({
      data: {
        name: profileJson.name,
        email: profileJson.email,
        profilePic: profileJson.picture.url,
        facebookId: profileJson.id,
        provider: "facebook",
      },
    });
    const token = generateToken(newUser.id);
    return res.json({ user: newUser, token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Unable to verify" });
  }
};

module.exports = { googleAuth, facebookAuth };
