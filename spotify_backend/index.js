const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/song');
const playlistRoutes = require('./routes/playlist');
const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = 8080;

app.use(cors({
    origin: ["https://music-streaming-app", "http://localhost:8080"],
}));
app.use(express.json());

mongoose
    .connect(
        process.env.MONGO_CONNECTION,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then((x) => {
        console.log("Connected to Mongo!");
    })
    .catch((err) => {
        console.log("Error while connecting to Mongo");
        console.log(err);
    });

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    const user = User.findOne({id: jwt_payload.sub});
    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}));

app.get("/", (req,res) => {
    res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);

app.listen(port, () => {
    console.log("App is running on port " + port)
});
