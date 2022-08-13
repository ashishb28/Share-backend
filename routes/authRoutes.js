const express = require('express');
const router = express.Router()
const { authController } = require('../controller/authController');
const RequireSignIn = require('../middleware');

router.post("/register", authController.Register);
router.post("/login", authController.Login);
router.get("/current-user", RequireSignIn, authController.CurrentUser);

router.put("/update-profile", RequireSignIn, authController.UpdateUserProfile);
router.get("/find-people", RequireSignIn, authController.FriendSuggestion);

router.put("/user-follow", RequireSignIn, authController.AddFollower, authController.UserFollow)
router.get("/following-list", RequireSignIn, authController.UserFollowingList)
router.put("/user-unfollow", RequireSignIn, authController.RemoveFollower, authController.UserUnFollow)

router.get("/search-user/:query", authController.SearchUser)
router.get("/user/:id", authController.UserProfile)

module.exports = router;