const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();
const PORT = 3000;
const Category = require("./models/article.js");

function checkRequestContent(req) {
  if (req.body.name) {
    return {
      title: req.body.title,
      articles: [
        {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          createdAt: new Date(),
          article: true,
        },
      ],
    };
  } else {
    return {
      title: req.body.title,
      articles: [
        {
          name: "",
          price: "",
          description: "",
          createdAt: new Date(),
        },
      ],
    };
  }
}

const dburl = `mongodb+srv://shop:${process.env.PASSWORD}@shop.ecyouvg.mongodb.net/shop?retryWrites=true&w=majority`;

mongoose
  .connect(dburl)
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
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("home");
});

app.get("/home", (req, res) => {
  Category.aggregate([
    {
      $unwind: "$articles",
    },
    {
      $match: {
        "articles.article": true,
      },
    },
    {
      $sort: {
        "articles.createdAt": -1,
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          mergeObjects: ["$$ROOT", "articles"],
        },
      },
    },
    {
      $project: {
        products: 0,
      },
    },
  ])
    .limit(3)
    .then((data) => {
      Category.find()
        .then((resp) => {
          res.render("home", {
            title: "Sport Shop",
            category: resp,
            lastArticles: data,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

app.post("/home", (req, res) => {
  Category.find({ title: req.body.title }).then((result) => {
    if (result.length === 0) {
      let category;
      if (req.body.name) {
        category = new Category({
          title: req.body.title,
          articles: [
            {
              name: req.body.name,
              price: req.body.price,
              description: req.body.description,
              createdAt: new Date(),
              article: true,
            },
          ],
        });
      } else {
        category = new Category({
          title: req.body.title,
          articles: [
            {
              name: "",
              price: "",
              description: "",
              createdAt: new Date(),
            },
          ],
        });
      }
      category
        .save()
        .then((result) => {
          res.redirect("/home");
        })
        .catch((err) => console.log(err));
    } else {
      if (req.body.name) {
        Category.updateOne(
          { title: req.body.title },
          {
            $push: {
              articles: {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                createdAt: new Date(),
                article: true,
              },
            },
          }
        ).then((result) => {
          res.redirect(`/home/${req.body.title}`);
        });
      } else {
        Category.replaceOne(
          { title: req.body.title },

          checkRequestContent(req)
        )
          .then((result) => {
            res.redirect(`/home/${req.body.title}`);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  });
});

app.get("/home/:title", (req, res) => {
  const title = req.params.title;
  Category.find({ title: title })
    .then((result) => {
      res.render("category", {
        title: title,
        articles: result[0].articles,
      });
    })
    .catch((err) => {
      res.status(404).render("404", {
        title: "404 Error",
      });
    });
});

app.get("/home/:title/createArticle", (req, res) => {
  const title = req.params.title;
  Category.find({ title: title })
    .then((result) => {
      res.render("createArticle", {
        title: title,
      });
    })
    .catch((err) => {
      res.status(404).render("404", {
        title: "404 Error",
      });
    });
});

app.get("/home/:title/:id", (req, res) => {
  const title = req.params.title;
  const id = req.params.id;
  Category.find({ title: title }).then((result) => {
    res.render("singleArticle", {
      title: title,
      article: result[0].articles.find((art) => art._id.toString() == id),
    });
  });
});

app.delete("/home/:title", (req, res) => {
  const title = req.params.title;
  Category.findOneAndDelete(title)
    .then((result) => {
      res.json({ redirect: "/home" });
    })
    .catch((err) => {
      console.log(err);
    });
});
//

app.delete("/home/:title/:id", (req, res) => {
  const id = req.params.id;
  const title = req.params.title;
  Category.updateOne(
    {
      title: title,
    },
    { $pull: { articles: { _id: id } } }
  )
    .then((result) => {
      res.json({ redirect: `/home/${title}` });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/createCategory", (req, res) => {
  res.render("createCategory", { title: "Adauga o categorie" });
});

app.use((req, resp) => {
  resp.status(404).render("404", { title: "404 Error" });
});
