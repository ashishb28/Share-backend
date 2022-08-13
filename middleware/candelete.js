const Post = require("../models/Post");

const CanDeletePost =async(req, res, next)=>{
    try {
        const post =await Post.findById(req.params.id);
        if(post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(400).send("Invalid Operation")
        }
        next()
    } catch (error) {
        console.log(error)
    }
}

module.exports = CanDeletePost;