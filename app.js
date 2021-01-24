const express = require("express");
const app = express();
const mongoose = require("mongoose");
const keys = require("./config/keys");
//const { use } = require("./routes/user");
const userRoute = require("./routes/user");

mongoose.connect(keys.mongodb.dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, () => {
    console.log("connected to mongodb");
})

app.use(express.json());
app.use("/users", userRoute);

app.get("/", (req, res) => {
    res.status(200).send("Home page");
})
app.listen(5006, () => console.log("app is running at 5006"));
