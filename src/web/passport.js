import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";

import User from "../database/models/User";

const scopes = ["identify", "email", "guilds"];

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.HOST_URL}/login/callback`,
    scope: scopes
}, (accessToken, refreshToken, profile, done) => {
    User.findOneAndUpdate({ id: profile.id }, { email: profile.email }, { upsert: true, new: true }, (err, doc) => {
        return done(null, {
            id: doc.id,
            email: doc.email,
            avatar: profile.avatar,
            username: profile.username,
            discriminator: profile.discriminator
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    done(null, id);
});