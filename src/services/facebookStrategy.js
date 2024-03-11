const passport = require("passport");
const { Strategy } = require("passport-facebook");

const facebookLogin = new Strategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/auth/facebook/redirect",
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log({ profile }, "facebook");
    return done(null, profile);
  }
);

passport.use(facebookLogin);
