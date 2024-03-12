const passport = require("passport");
const { Strategy } = require("passport-facebook");

const db = require("../services/db");

const facebookLogin = new Strategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/auth/facebook/redirect",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await db.user.findUnique({
        where: {
          facebookId: profile.id,
        },
      });
      if (user) return done(null, user);
    } catch (e) {
      console.error(e);
      return done(e);
    }

    try {
      const newUser = await db.user.create({
        data: {
          name: profile.displayName,
          email: profile.email,
          profilePic: profile.picture,
          facebookId: profile.id,
          provider: "facebook",
        },
      });

      return done(null, newUser);
    } catch (e) {
      console.error(e);
      return done(e);
    }

    console.log({ profile }, "facebook");
    return done(null, profile);
  }
);

passport.use(facebookLogin);
