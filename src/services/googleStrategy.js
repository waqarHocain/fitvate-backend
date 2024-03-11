const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const db = require("../services/db");

const googleLogin = new GoogleStrategy(
  {
    clientID: process.env["GOOGLE_CLIENT_ID"],
    clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
    callbackURL: "/auth/google/redirect",
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await db.user.findUnique({
        where: {
          googleId: profile.id,
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
          googleId: profile.id,
          provider: "google",
        },
      });

      return done(null, newUser);
    } catch (e) {
      console.error(e);
      return done(e);
    }
  }
);

passport.use(googleLogin);
