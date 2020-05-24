
const User = require('../models/user')
const jwt = require('jsonwebtoken'); //to generate signed token
const expressJwt = require('express-jwt');
const {errorHandler} = require('../helpers/dbErrorHandler')

// using promise
exports.signup = (req, res) => {
    // console.log("req.body", req.body);
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
                //error: 'Email is taken'
            });
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    });
};

exports.signin =(req, res) => {
    //find the user by e-mail
    const { email, password } = req.body
    User.findOne({email}, (err, user) =>{
        if(!err && user) {
            //create authenticate method in user model
        if(!user.authenticate(password)) {
            return res.status(401).json({
                error: 'Email and password dont match'
            })
        }
        //generate a signed token with user id and secret
        token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
        //persist the token as 't' in cookie with expiry date
        res.cookie('t', token, {expirte: new Date() + 9999})
        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})
        } 
        return res.status(400).json({
            err: 'Não existe usuário para esse e-mail. Por favor, registre-se!'
        })
        
    })
}

exports.signout = (req, res) => {
    res.clearCookie('t')
    res.json({message: "Signout success"})
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
})

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if(!user){
        return res.status(403).json({
            error: "access denied"
        })
    }
    next()
}

exports.isAdmin = (req, res, next) => {
    //role = 0 = comum user
    //role = 1 = admin user
    if(req.profile.role === 0) {
        return res.status(403).json ({
            error:'Admin resourse! access denied'
        })
    } 
    next();
}