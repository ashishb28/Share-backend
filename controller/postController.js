const Post = require("../models/Post");
const Cloudinary = require("cloudinary");
const User = require("../models/User");

Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const postController = {
    CreatePost:  async (req, res) => {
        //   console.log("post => ", req.body);
        const { content, image } = req.body;
        if (!content.length) {
          return res.json({
            error: "Content is required",
          });
        }
        try {
          const post = new Post({ content, postedBy: req.user._id , image});
          post.save();
          res.json(post);
        } catch (err) {
          console.log("CreatePost_ERROR => ",err);
          res.sendStatus(400);
        }
      },
      UploadImage: async(req, res) => {
        //console.log(req.files);
        try {
          const result = await Cloudinary.uploader.upload(req.files.image.path)
          //console.log(result);
          return res.json({
            url: result.secure_url,
            public_id: result.public_id
          })
        } catch (error) {
          console.log(" UPLOAD_IMAGE_ERROR => ", error)
          return res.status(500).json({error})
        }
      },
      GetPostByUser:async(req, res) =>{
        try {
          const pageNum = req.query.page || 1
          let perPage = 2
          let itemsPerPage = perPage * pageNum;

          const posts = await Post.find({ postedBy: req.user._id })
            //.skip((currentpage - 1) * perPage)
            .populate("postedBy", "_id name photo")
            .populate("comments.postedBy", "_id name photo")
            .sort({ createdAt: -1 })
            .limit(itemsPerPage);

            const totalPosts = await (await Post.find({ postedBy:  req.user._id })).length
          res.json({posts, length: posts.length, totalPosts });
          // console.log('posts',posts)
          //res.json(posts);
        } catch (err) {
          console.log("GetPostByUser =>", err);
          return res.status(500).json({err})
        }
      },
      GetPostById: async(req, res) => {

          try {
            const post = await Post.findById(req.params.id)
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image");
            return res.json(post);
          } catch (error) {
            console.log("GetPostById => ",error)
            return res.status(500).json({error})
          }


      },
      UpdatePostById: async(req, res)=> {

        try {
          const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true
          });
          return res.json(post)
        } catch (error) {
          
          console.log("UpdatePostById_ERROR =>",error)
          return res.status(500).json({error})
        }
      },
      DeletePostById: async(req, res) => {

        try {
          const post = await Post.findByIdAndDelete(req.params.id);
          if(post && post.image && post.image.public_id) {
            const  image = await Cloudinary.uploader.destroy(post.image.public_id); 
          }
          return res.json({ok: true})
        } catch (error) {
          console.log("DeletePostById_ERROR =>",error)
          return res.status(500).json({error})
        }

      },
      GetUserFeeds: async(req, res) =>{
        try {
          const pageNum = req.query.page || 1
          let perPage = 2
          let itemsPerPage = perPage * pageNum;
          const user = await User.findById(req.user._id);
          let following = user.following;
          following.push(req.user._id);
          const posts = await Post.find({ postedBy: {$in: following} })
          .populate("postedBy", "_id name photo")
          .populate("comments.postedBy", "_id name image")
          .sort({ createdAt: -1 })
          .limit(itemsPerPage);
          // console.log('posts',posts)
          const totalPosts = await Post.find({ postedBy: {$in: following} });  
          res.json({posts, length: posts.length, totalPosts: totalPosts.length });
        } catch (err) {
          console.log("DeletePostById_ERROR =>",err)
          return res.status(500).json({err})
        }
      },
      LikePost : async (req, res) => {
        try {
          const post = await Post.findByIdAndUpdate(
            req.body._id,
            {
              $addToSet: { likes: req.user._id },
            },
            { new: true }
          );
          res.json(post);
        } catch (error) {
          console.log("LIKE_ERROR =>",error)
          return res.status(500).json({error})
        }
      }
      ,UnlikePost: async (req, res) => {
        try {
          const post = await Post.findByIdAndUpdate(
            req.body._id,
            {
              $pull: { likes: req.user._id },
            },
            { new: true }
          );
          res.json(post);
        } catch (error) {
          console.log("UNLIKE_ERROR =>",error)
          return res.status(500).json({error})
        }
      },
      AddComment: async (req, res) => {
        try {
          const { postId, comment } = req.body;
          const post = await Post.findByIdAndUpdate(
            postId,
            {
              $push: { comments: { text: comment, postedBy: req.user._id } },
            },
            { new: true }
          )
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image");
          res.json(post);
        } catch (error) {
          console.log("AddComment_ERROR =>",error)
          return res.status(500).json({error})
        }
      }
      ,RemoveComment: async (req, res) => {
        try {
          const { postId, comment } = req.body;
          const post = await Post.findByIdAndUpdate(
            postId,
            {
              $pull: { comments: { _id: comment._id } },
            },
            { new: true }
          );
          res.json(post);
        } catch (error) {
          console.log("RemoveComment_ERROR =>",error)
          return res.status(500).json({error})
        }
      },
      TotalPosts: async(req, res) => {
        try {
          const total = await Post.find().estimatedDocumentCount();
          return res.json(total)
        } catch (error) {
          console.log(error)
        }
      }
}

module.exports = {postController}