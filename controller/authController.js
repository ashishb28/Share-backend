const { HashPassword, ComparePassword } = require("../helper/auth");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
//const { nanoid } = require("nanoid")

    const authController = {

    Register: async(req, res) =>{
        
        const { name, email, password } = req.body;
        let secret = "red";
        // validation
        if (!name) return res.status(400).send("Name is required");
        if (!password || password.length < 6)
          return res
            .status(400)
            .send("Password is required and should be 6 characters long");
        if (!secret) return res.status(400).send("Answer is required");
        const exist = await User.findOne({ email });
        if (exist) return res.status(400).send("Email is taken");
        // hash password
        const hashedPassword = await HashPassword(password);
      
        const user = new User({ name, email, password: hashedPassword, secret });
        try {
          await user.save();
          //console.log("REGISTERED USE => ", user);
          return res.json({
            ok: true,
          });
        } catch (err) {
          console.log("REGISTER FAILED => ", err);
          return res.status(400).send("Error. Try again.");
        }
    },
    Login: async(req, res) =>{
      try {
        const { email, password } = req.body;
        // check if our db has user with that email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send("No user found");
        // check password
        const match = await ComparePassword(password, user.password);
        if (!match) return res.status(400).send("Wrong password");
        // create signed token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        user.password = undefined;
        user.secret = undefined;
        res.json({
          token,
          user,
        });
      } catch (err) {
        console.log("LOGIN_ERROR => ", err);
        return res.status(400).send("Error. Try again.");
      }
    },
    CurrentUser: async(req, res) => {
      try {
        const user = await User.findById(req.user._id);
        return res.json({ok: true});
      } catch (error) {
        console.log(error)
        return res.sendStatus(400);
      }

    },
    UpdateUserProfile: async(req, res) => {
      const { name, about, image } = req.body;
      try {
        const user = await User.findByIdAndUpdate(req.user._id, {name, about, photo: image}, {new: true})
          user.password = undefined;
          user.secret = undefined;
          return res.json({user, ok: true})
      } catch (error) {
        console.log("UpdateUserProfile_ERROR => ", error)
        res.status(500).send({error: error});
      }

    },
    FriendSuggestion: async(req, res) => {
      try {
        const user = await User.findById(req.user._id);
        let following = user.following;
        following.push(user._id);
        const people = await User.find({_id: { $nin: following }})
        .select("-password -secret")
        .limit(10);
        res.json(people);
      } catch (error) {
        console.log("FRIEND_SUGGESTION_ERROR => ", error);
        res.status(500).send({error: error});
      }
    },
    AddFollower: async(req, res, next) => {
        try {
          const user = await User.findByIdAndUpdate(req.body.id, {
            $addToSet: { followers: req.user._id }
          })
          next();
        } catch (error) {
          console.log("AddFollower_ERROR => ",error);
          return res.status(500).json(error)
        }
    }, 
    UserFollow: async(req, res) => {
        try {
          const user = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { following: req.body.id }
          }, {new: true}).select("-password -secret" )
          return res.json(user)
        } catch (error) {
          console.log("UserFollow_ERROR => ",error)
          return res.status(500).json(error)
        }
    },
    RemoveFollower: async(req, res, next) => {
      try {
        const user = await User.findByIdAndUpdate(req.body.id, {
          $pull: { followers: req.user._id }
        })
        next();
      } catch (error) {
        console.log("REMOVE_FOLLOWER_ERROR => ",error)
        return res.status(500).json(error)
      }
  },
    UserUnFollow: async(req, res) => {
        try {
          const user = await User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.id }
          }, {new: true}).select("-password -secret" )
          return res.json(user)
        } catch (error) {
          console.log("UserUnFollow_ERROR => ",error)
          return res.status(500).json(error)
        }
    },
    UserFollowingList: async(req, res) => {
      try {
        const user = await User.findById(req.user._id);
        const following = await User.find({_id: user.following}).limit(100);
        return res.json(following);
      } catch (error) {
        console.log("UserFollowingList => ",error);
        return res.status(500).json(error);
      }
    },
    UserFollowersList: async(req, res) => {
      try {
        const user = await User.findById(req.user._id);
        const followers = await User.find({_id: user.followers}).limit(100);
        return res.json(followers);
      } catch (error) {
        console.log("UserFollowersList => ",error);
        return res.status(500).json(error);
      }
    },
    SearchUser: async(req, res) => {

      const { query } = req.params;
      if(!query) return;
      try {
        const user = await User.find({ 
              $or: [{name: {$regex: query, $options: 'i'}}] 
            }).select('_id name image')
            return res.json(user);
      } catch (error) {
        console.log("SEARCH_USER_ERROR => ",error);
        return res.status(500).json(error)
      }

    },
    UserProfile: async(req, res) => {
      try {
        const user = await User.findOne({_id: req.params.id}).select('-password -secret');
        return res.json(user);
      } catch (error) {
        console.log("USER_PROFILE_ERROR => ",error);
        return res.sendStatus(400);
      }

    }

}


module.exports = {authController}