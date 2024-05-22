require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const quizRoutes = require("./routes/quiz")
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoute);
app.use("/", quizRoutes);

app.get("/", (req, res) => {
  res.send("home page");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("DB connected");
  })
  .catch((error) => {
    console.log(`Falied to connect to database at ${process.env.PORT}`, error);
  });

app.listen(process.env.PORT, () => {
  console.log(`Backend server listening at ${process.env.PORT}`);
});
