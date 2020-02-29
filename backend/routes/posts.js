const express = require("express");

const PostController = require("../controllers/posts")

const checkAuth = require("../middleware/check-auth");
const  extractFile = require("../middleware/file")

const router = express.Router();

router.post(
  "",
  checkAuth,
  extractFile,
  PostController.createPosts
 );

// app.put updates completely all object
// app.patch updates only required part of object
router.put(
  "/:id",
  checkAuth,
  extractFile,
  PostController.updatePost
  );

router.get("", PostController.getAllPosts);

router.get("/:id", PostController.getPostById);

router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;