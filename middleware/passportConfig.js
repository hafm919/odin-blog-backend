const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      const user = await prisma.user.findUnique({ where: { email } });
      try {
        if (!user) {
          return done(null, false, {
            message: "User not found. Please sign up!",
          });
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return done(null, user, { message: "Logged  in successfully!" });
        }
        return done(null, false, { message: "Invalid password" });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AUTHENTICATION_SECRET,
    },
    async (jwtPayload, done) => {
      // The user is already in the payload, so just pass it along
      console.log("JWT Payload:", jwtPayload);
      const user = await prisma.user.findUnique({
        where: { id: jwtPayload.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          password: false,
        },
      });
      return done(null, user); // Attach user data from payload
    }
  )
);

module.exports = passport;
