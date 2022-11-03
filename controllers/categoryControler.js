const Category = require("../models/article.js");
const path = require("path");
const fs = require("fs");
function checkRequestContent(req) {
  if (req.file) {
    return {
      title: req.body.title,
      articles: [
        {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          createdAt: new Date(),
          article: true,
          img: {
            data: fs.readFileSync(
              path.join(__dirname, "..", "/uploads/" + req.file.filename)
            ),
            contentType: "image/png",
          },
        },
      ],
    };
  } else if (req.body.name) {
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
const showHome = (req, res) => {
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
};

const postHome = (req, res) => {
  Category.find({ title: req.body.title }).then((result) => {
    if (result.length === 0) {
      let category;
      if (req.file) {
        category = new Category({
          title: req.body.title,
          articles: [
            {
              name: req.body.name,
              price: req.body.price,
              description: req.body.description,
              createdAt: new Date(),
              article: true,
              img: {
                data: fs.readFileSync(
                  path.join(__dirname, "..", "/uploads/" + req.file.filename)
                ),
                contentType: "image/png",
              },
            },
          ],
        });
      } else if (req.body.name) {
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
      if (req.file) {
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
                img: {
                  data: fs.readFileSync(
                    path.join(__dirname, "..", "/uploads/" + req.file.filename)
                  ),
                  contentType: "image/png",
                },
              },
            },
          }
        ).then((result) => {
          res.redirect(`/home/${req.body.title}`);
        });
      } else if (req.body.name) {
        console.log(req);
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
};

const showHomeTitle = (req, res) => {
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
};

const showTitleCreateArticle = (req, res) => {
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
};

const showHomeTitleArticle = (req, res) => {
  const title = req.params.title;
  const id = req.params.id;
  Category.find({ title: title }).then((result) => {
    res.render("singleArticle", {
      title: title,
      article: result[0].articles.find((art) => art._id.toString() == id),
    });
  });
};

const deleteHomeTitle = (req, res) => {
  const title = req.params.title;
  console.log(req.body.id);
  Category.deleteOne({ title })
    .then((result) => {
      res.json({ redirect: "/home" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteHomeTitleArticle = (req, res) => {
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
};

const showHomeTitleEditArticle = (req, res) => {
  const title = req.params.title;
  const id = req.params.id;
  Category.find({ title: title }).then((result) => {
    res.render("edit", {
      title: title,
      article: result[0].articles.find((art) => art._id.toString() == id),
    });
  });
};

const postEdited = (req, res) => {
  const title = req.body.title;
  const id = req.body.id;
  if (req.file) {
    Category.updateOne(
      { "articles._id": id },
      {
        "articles.$": {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          createdAt: new Date(),
          article: true,
          img: {
            data: fs.readFileSync(
              path.join(__dirname, "..", "/uploads/" + req.file.filename)
            ),
            contentType: "image/png",
          },
        },
      }
    ).then((resonse) => {
      res.redirect(`/home/${title}`);
    });
  } else {
    Category.updateOne(
      { "articles._id": id },
      {
        "articles.$": {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          createdAt: new Date(),
          article: true,
        },
      }
    ).then((resonse) => {
      res.redirect(`/home/${title}`);
    });
  }
};

module.exports = {
  showHome,
  postHome,
  showHomeTitle,
  showTitleCreateArticle,
  showHomeTitleArticle,
  deleteHomeTitle,
  deleteHomeTitleArticle,
  showHomeTitleEditArticle,
  postEdited,
};
