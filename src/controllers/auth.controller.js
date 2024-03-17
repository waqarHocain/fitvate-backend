const url = require("url");
const bcrpyt = require("bcrypt");

const db = require("../services/db");
const { generateToken } = require("../utils/generateToken");
const { generateReqId } = require("../utils/generateReqId");

const googleAuth = async (req, res) => {
  // provided an idToken, verifies it from Google server and create / retrieves user
  const { idToken } = req.body;
  const requestId = generateReqId();

  if (!idToken)
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      message: "Id token is missing.",
      requestId,
    });

  const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;

  try {
    const response = await fetch(googleUrl);
    if (response.status !== 200)
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid token",
        timestamp: new Date(),
        requestId,
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
        return res.json({ status: "success", data: { user, token } });
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
      delete newUser.password;
      return res.json({ status: "success", data: { user: newUser, token } });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        status: "error",
        code: 500,
        message: "Failed to connect to db.",
        timestamp: new Date(),
        requestId,
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Unable to verify token",
    });
  }
};

const facebookAuth = async (req, res) => {
  /* verify provided input_token with facebook server, if it is valid then creates / retrieves the user profile.
  - https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow#checktoken
  - https://developers.facebook.com/docs/graph-api/overview/#fields
  */
  const { idToken } = req.body;
  const requestId = generateReqId();

  if (!idToken)
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "Id token is missing.",
    });

  const appId = process.env.FACEBOOK_CLIENT_ID;
  const appSecret = process.env.FACEBOOK_CLIENT_SECRET;
  // const verifyUrl = `"https://graph.facebook.com/debug_token?input_token=${idToken}&access_token=${appId}|${appSecret}`;
  const verifyUrl = url.format({
    protocol: "https",
    hostname: "graph.facebook.com",
    pathname: "/debug_token",
    query: {
      input_token: idToken,
      access_token: `${appId}|${appSecret}`,
    },
  });

  try {
    const response = await fetch(`${verifyUrl}`);
    if (response.status !== 200) {
      return res.status(400).json({
        status: "error",
        code: 400,
        timestamp: new Date(),
        requestId,
        error: "Invalid id token.",
      });
    }

    const json = await response.json();
    const userId = json.data.user_id;
    if (json.data.app_id !== appId || !userId)
      return res.status(400).json({
        status: "error",
        code: 400,
        timestamp: new Date(),
        requestId,
        error: "Invalid id token.",
      });

    // check if user already exists
    const user = await db.user.findUnique({
      where: {
        facebookId: userId,
      },
    });
    if (user) {
      const token = generateToken(user.id);
      delete user.password;
      return res.json({ status: "success", data: { user, token } });
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
    delete newUser.password;
    return res.json({ status: "success", data: { user: newUser, token } });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Unable to verify",
    });
  }
};

// email signup and login
const signup = async (req, res) => {
  const requestId = generateReqId();
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const profilePic = req.body.profilePic;
  const mobileNumber = req.body.mobileNumber;
  const dateOfBirth = req.body.dateOfBirth;
  const gender = req.body.gender;
  const height = req.body.height;
  const weight = req.body.weight;

  // data validation
  if (
    !name ||
    !email ||
    !password ||
    !profilePic ||
    !mobileNumber ||
    !dateOfBirth ||
    !gender ||
    !height ||
    !weight
  ) {
    return res.status(422).json({
      status: "error",
      code: 422,
      message: "Enter All Values",
      timestamp: new Date(),
      request_id: requestId,
    });
  } else if (password.length < 8) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Password cannot be less than 8 characters",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  // check for existing user account
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "User Already Exist",
        timestamp: new Date(),
        request_id: requestId,
      });
    }
    const passwordHash = bcrpyt.hashSync(password, 10);
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        mobileNumber,
        height,
        weight,
        gender,
        profilePic,
        dateofBirth: dateOfBirth,
      },
    });
    delete newUser.password;

    return res.json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
      timestamp: new Date(),
      request_id: requestId,
    });
  }
};

const login = async (req, res) => {
  const request_id = generateReqId();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({
      status: "error",
      code: 422,
      message: "Enter All Values",
      timestamp: new Date(),
      request_id,
    });
  }

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(422).json({
        status: "error",
        code: 422,
        message: "Invalid Credentials",
        timestamp: new Date(),
        request_id,
      });
    }
    const passwordMatches = bcrpyt.compareSync(password, user.password);
    if (!passwordMatches) {
      return res.status(422).json({
        status: "error",
        code: 422,
        message: "Invalid Credentials",
        timestamp: new Date(),
        request_id,
      });
    }

    const token = generateToken(user.id);
    return res.json({
      status: "success",
      data: {
        token,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
      timestamp: new Date(),
      request_id,
    });
  }
};
module.exports = { googleAuth, facebookAuth, signup, login };
