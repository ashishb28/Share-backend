const express = require("express");
const RequireSignIn = require('../middleware')
const router = express.Router();
const formidable = require("express-formidable");

// controllers
const  { postController } = require("../controller/postController");
const CanDeletePost = require("../middleware/candelete");

router.post("/create-post", RequireSignIn , postController.CreatePost);
router.post("/upload-image", RequireSignIn , formidable({maxFileSize: 7*1024*1024}), postController.UploadImage);
router.get("/user-posts", RequireSignIn , postController.GetPostByUser);
router.get("/my-feeds", RequireSignIn , postController.GetUserFeeds);
router.get("/user-post/:id", RequireSignIn, postController.GetPostById)
router.put("/update-post/:id", RequireSignIn, CanDeletePost, postController.UpdatePostById)
router.delete("/delete-post/:id", RequireSignIn, CanDeletePost, postController.DeletePostById);
router.put("/like-post", RequireSignIn, postController.LikePost);
router.put("/unlike-post", RequireSignIn, postController.UnlikePost);
router.put("/add-comment", RequireSignIn, postController.AddComment);
router.put("/remove-comment", RequireSignIn, postController.RemoveComment);
router.get("/total-posts", postController.TotalPosts)

module.exports = router;