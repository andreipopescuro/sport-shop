const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");

const bodyParser = require("body-parser");

require("dotenv").config();
const PORT = 3000;

const categoryRoutes = require("./routes/categoryRoutes");

const dburl = `mongodb+srv://shop:${process.env.PASSWORD}@shop.ecyouvg.mongodb.net/shop?retryWrites=true&w=majority`;
                                    //  shop2022  ps
mongoose
  .connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(PORT, () => {
      console.log("Server live");
    });
  })
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.set("views", "docs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("home");
});

app.use("/home", categoryRoutes);

app.get("/createCategory", (req, res) => {
  res.render("createCategory", { title: "Adauga o categorie" });
});

app.use((req, resp) => {
  resp.status(404).render("404", { title: "404 Error" });
});
