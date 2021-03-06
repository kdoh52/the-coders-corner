const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
require("dotenv").config();

const mongoose = require("mongoose");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(cors());
app.use(express.json());

// tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({ extended: false }));
// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require("./passport/local-signup");
const localLoginStrategy = require("./passport/local-login");
passport.use("local-signup", localSignupStrategy);
passport.use("local-login", localLoginStrategy);

// pass the authenticaion checker middleware
//const authCheckMiddleware = require('./middleware/auth-check');
//app.use('/api', authCheckMiddleware);

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
// Add routes, both API and view
app.use(routes);

// Connect to the Mongo DB
const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Established connection with MongoDB database.");
});

// Start the API server
const server = app.listen(PORT, function () {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});

var expressWs = require('express-ws')(app);
//const http = require("http").createServer(app)

const io = require("socket.io")(server, {
  cors: {
    origin: process.env.SOCKET_URL || "http://localhost:3000",
    //ws: "//the-coders-corner.herokuapp.com/socket.io/?EIO=4&transport=websocket",
    methods: ["GET", "POST"],
  },
});

// http.listen(PORT, function () {
//   console.log(`SocketIO Listening on port : ${PORT}`)
// });

io.on("connection", (socket) => {
  socket.on("message", ({ name, message }) => {
    io.emit("message", { name, message });
  });
});
