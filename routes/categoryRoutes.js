const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });
const categoryController = require("../controllers/categoryControler");
const router = express.Router();

router.get("/", categoryController.showHome);

router.post("/", upload.single("image"), categoryController.postHome);

router.get("/:title", categoryController.showHomeTitle);

router.get("/:title/createArticle", categoryController.showTitleCreateArticle);

router.get("/:title:id", categoryController.showHomeTitleArticle);

router.delete("/:title", categoryController.deleteHomeTitle);

router.delete("/:title/:id", categoryController.deleteHomeTitleArticle);

module.exports = router;
