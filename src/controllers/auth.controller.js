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

module.exports = { googleAuth };
