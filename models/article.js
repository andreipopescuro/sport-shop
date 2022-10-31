const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: {
    type: String,
    unique: true,
  },
  articles: [
    {
      name: String,
      price: String,
      description: String,
      createdAt: Date,
      article: Boolean,
    },
  ],
});

const Category = mongoose.model("categories", categorySchema);
module.exports = Category;
