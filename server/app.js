if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

const port = process.env.PORT || 4000;

const authentication = require("./middlewares/authenticate");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart CV Assistant API");
});

// Importing route controllers
const CvController = require("./controllers/CvController");
const UserController = require("./controllers/UserController");

// Public health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Smart CV Assistant API is running",
    timestamp: new Date().toISOString(),
  });
});

app.post("/register", UserController.register);
app.post("/login", UserController.loginUser);

// Apply authentication middleware for routes below
app.use(authentication);

// Endpoints for CV management
const upload = require("./middlewares/uploadMiddleware");

app.post("/api/cvs/upload", upload.single("file"), CvController.uploadCV);
app.get("/api/cvs", CvController.getUserCVs);
app.get("/api/cvs/:id", CvController.getCVById);

// Apply error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}

module.exports = app;
