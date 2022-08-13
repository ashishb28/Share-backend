// const { expressjwt } = require('express-jwt');


// const RequireSignIn = expressjwt({
//     secret: process.env.JWT_SECRET,
//     algorithms: ["HS256"],
// });

// module.exports = RequireSignIn;

const Users = require("../models/User")
const jwt = require('jsonwebtoken')
const Post = require("../models/Post")


const RequireSignIn = async (req, res, next) => {
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(401).json({msg: "Invalid Authentication."})

        const decoded = jwt.verify(token.slice(7), process.env.JWT_SECRET)
        if(!decoded) return res.status(401).json({msg: "Invalid Authentication."})
        // console.log(decoded)
        const user = await Users.findOne({_id: decoded._id})
        
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({msg: err.message})
    }
}


module.exports = RequireSignIn
