const express=require("express");
const router=express.Router({mergeParams:true});
const passport=require("passport");
const User=require("../models/user");
const Social=require("../models/social");
var async=require("async");
var nodemailer=require("nodemailer");
var crypto=require("crypto");
const middleware=require("../middleware");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.sendgrid_api_key);
var { promisify } = require('util');
var sizeOf = promisify(require('image-size'));
var multer = require('multer');
var storage = multer.diskStorage({filename: function(req, file, callback) {callback(null, Date.now() + file.originalname);}});
var imageFilter = function(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);}
  cb(null, true);};
var upload = multer({ storage: storage, fileFilter: imageFilter })
var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'dcsgaregd',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
/////////////////////////////////////////////// Landing Page
router.get("/",(req,res)=>{res.render("landing");});
//////////////////////////////////////////////////////////// Documentation Page
router.get("/documentation",middleware.isLoggedIn,(req,res)=>{res.render("documentation");});
/////////////////////////////////////////////////////////////////////////////////////Google Authentication
router.get("/auth/google",passport.authenticate("google",{scope:["email"]}));
router.get('/auth/google/secrets', passport.authenticate('google',{ failureRedirect: '/login' }),
function(req, res) {res.redirect('/socials');});
//////////////////////////////////////////////////////////////////// Sign Up Page
router.get("/register",(req,res)=>{res.render("register");});
router.post("/register", upload.single('avatar'), function(req, res) {
cloudinary.v2.uploader.upload(req.file.path,function(err,result){
  if(err) {
    req.flash('error', err.message);
    return res.redirect('back');}
    req.body.avatar = result.secure_url;
    req.body.avatarId = result.public_id;
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: result.secure_url,
        avatarId: result.public_id,
        description: req.body.description
      })
      if(req.body.adminCode===process.env.adminCode){newUser.isAdmin=true;}
      User.register(newUser, req.body.password, function(err, user) {
        if (err) {return res.render("register", { "error": err.message + " Email Already Exists !" });}
        else {passport.authenticate("local")(req, res, function() {
              console.log(req.body.username);
              req.flash("success", "Welcome to Socials ! " + user.firstName);
              return res.redirect("/socials");})}})
});
})
///////////////////////////////////////////////////// Login Page
router.get("/login",(req,res)=>{res.render("login");});
router.post("/login",passport.authenticate("local",{successRedirect:"/socials",failureRedirect:"/login"}),(req,res)=>{});
/////////////////////////////////////////////////////////  Logout Page
router.get("/logout",(req,res)=>{req.logout();
 req.flash("success","Successfly, Logged You Out! Please Visit Us Again");
 res.redirect("/socials");});
//////////////////////////////////////////////////////   Forgot Page
router.get('/forgot', function(req, res){res.render('forgot');});
router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);});
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);});
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {user: 'ddddevesh2001@gmail.com',pass: process.env.gmailPassword}});
        var mailOptions = {
          to: user.email,
          from: 'ddddevesh2001@gmail.com',
          subject: 'Socials Password Reset',
          text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'+
            'All Rights Reserved. This mail is from Devesh Prasad owner of Socials, To contact him Mail deveshprasad577@yahoo.com. \n'};
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');});}], function(err) {if (err) return next(err);res.redirect('/forgot');});
});
////////////////////////////////////////////////  Reset Page  
router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {req.flash('error', 'Password reset token is invalid or has expired.');
                  return res.redirect('/forgot');}
      res.render('reset', {token: req.params.token});});
});
router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');}
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
              user.save(function(err) {
                req.logIn(user, function(err) {done(err, user);});
              });
            })}else{req.flash("error", "Passwords do not match.");
                    return res.redirect('back');}});},
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'ddddevesh2001@gmail.com',
            pass: process.env.gmailPassword
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'ddddevesh2001@gmail.com',
          subject: 'Socials password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'+
            'All Rights Reserved. This mail is from Devesh Prasad owner of Socials, To contact him Mail deveshprasad577@yahoo.com. \n'};
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/socials');
    });
  });
 ///////////////////////////////////////////////// User Profile Page
 router.get("/users/:id",(req,res)=>{
  User.findById(req.params.id,(err,foundUser)=>{
      if(err){req.flash("error","Something Went Wrong")
              res.redirect("/");}
      Social.find().where("author.id").equals(foundUser._id).exec((err,socials)=>{
        if(err){req.flash("error","Something Went Wrong")
                res.redirect("/");}   
        res.render("users/show",{user:foundUser,socials:socials})
      });});
 });  
 ///////////////////////////////////////////////////// Contact Page
 router.get("/contact",middleware.isLoggedIn,(req,res)=>{res.render("contact");});
router.post('/contact',middleware.isLoggedIn,async (req, res) => {
  let { name, email, message } = req.body;
  name = req.sanitize(name);
  email = req.sanitize(email);
  message = req.sanitize(message);
  const msg = {
    to: 'ddddevesh2001@gmail.com',
    from: "ddddevesh2001@gmail.com",
    subject: `Social Contact Form Submission from ${name}`,
    text: message,
    html: `
    <h1>Hi there, this email is from, ${name} regarding Socials</h1>
    <p>${message}</p>
    `,
  };  
  try {
    await sgMail.send(msg);
    req.flash('success', 'Thank you for your response, We will reply to your email ASAP.');
    res.redirect('/contact');
  } catch (error) {
    console.error(error);
    if (error.response) {console.error(error.response.body)}
    req.flash('error', 'Sorry, something went wrong, please contact deveshprasad577@yahoo.com');
    res.redirect('back');
  }
});
module.exports=router;