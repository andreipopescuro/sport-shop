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
      img: {
        data: Buffer,
        contentType: String,
      },
    },
  ],
});

const Category = mongoose.model("categories", categorySchema);
module.exports = Category;
