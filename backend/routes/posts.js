const express = require("express");
const multer = require("multer");

const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save()   // this is mongoose
    .then(createdPost => { 
    console.log(createdPost);
    res.status(201).json({
      message: "Post added successfully",
      // postId: createdPost._id   // becouse at first id is null!!!
      post: {
        // id: createdPost._id,
        // title: createdPost.title,
        // content: createdPost.content,
        // imagePath: createdPost.imagePath
        // shorter alternative:
        ...createdPost,
        id: createdPost._id
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: "Creating a post failed! This is message from backend file routes/post.js"
    })
  });
});

// app.put updates completely all object
// app.patch updates only required part of object
router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if(req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename
    };
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  console.log(post);
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
    // console.log(result);
    if (result.nModified > 0) {
      res.status(200).json({ message: "Update successful!" });
    } else {
      res.status(401).json({ message: "Not authorized! Update not successful!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Couldn't update post! This is message from backend file routes/post.js"
    });
  });
});

router.get("", (req, res, next) => {
  // const posts = [
  //   {
  //     id: "fadf12421l",
  //     title: "First server-side post",
  //     content: "This is coming from the server"
  //   },
  //   {
  //     id: "ksajflaj132",
  //     title: "Second server-side post",
  //     content: "This is coming from the server!"
  //   }
  // ];

  const pageSize = +req.query.pagesize;   // '+' converts string to number
  const currentPage = +req.query.page;
  const postQuery = Post.find();    //Post.find()   // this is mongoose
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize); //fetching only required part!!!
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed! This is message from backend file routes/post.js"
      });
    });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Fetching a posts failed! This is message from backend file routes/post.js"
    });
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })    // this is mongoose
  .then(result => {
    console.log(result);
    if (result.n > 0) {
      res.status(200).json({ message: "Deletion successful!" });
    } else {
      res.status(401).json({ message: "Not authorized! Deletion not successful!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Fetching a post failed! This is message from backend file routes/post.js"
    });
  });
});

module.exports = router;