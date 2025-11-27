const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Welcome"));

module.exports = app;
