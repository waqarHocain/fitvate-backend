const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");

const jwtLogin = new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (payload, done) => {
    return done(null, payload);
  }
);

passport.use(jwtLogin);
