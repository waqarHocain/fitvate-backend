const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const googleLogin = new GoogleStrategy(
  {
    clientID: process.env["GOOGLE_CLIENT_ID"],
    clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
    callbackURL: "/auth/google/redirect",
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    // console.log({ profile });
    done(null, profile);
  }
);

passport.use(googleLogin);
