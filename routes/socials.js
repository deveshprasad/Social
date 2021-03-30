const express=require("express");
const router=express.Router({mergeParams:true});
const social=require("../models/social");
const middleware=require("../middleware");
var multer = require('multer');

var storage = multer.diskStorage({filename: function(req, file, callback) {callback(null, Date.now() + file.originalname);}});

var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only Image Files Are Allowed!'), false);}
    cb(null, true);};

var upload = multer({ storage: storage, fileFilter: imageFilter})
var cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: 'dcsgaregd', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/////////////////////////////   Main Page
router.get("/",(req,res)=>{
    var noMatch=null;
   if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    social.find({name:regex},(err,social)=>{
        if(err){console.log(err);}
        else{
          if(social.length<1){
              var noMatch="NO SOCIAL WITH THAT NAME EXISTS!"
              }
                res.render("social/index",{social:social,noMatch:noMatch});
        }
    });
   }else{
    social.find({},(err,social)=>{
        if(err){
            console.log(err);
        }else{
         res.render("social/index",{social:social,noMatch:noMatch});
        }
    });
   }
});
router.post("/",middleware.isLoggedIn, upload.single('image'),(req,res)=>{
cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
    if(err) {req.flash('error', err.message);
             return res.redirect('back');}
    req.body.social.image = result.secure_url;
    req.body.social.imageId = result.public_id;
    req.body.social.author = {
      id: req.user._id,
      username: req.user.username
    }
    social.create(req.body.social, function(err, social) {
      if (err) {req.flash('error', err.message);
        return res.redirect('back');}
      res.redirect('/socials/' + social.id);
    });
  });
});
///////////////////////////// Add New Social Page
router.get("/new",middleware.isLoggedIn,(req,res)=>{
    res.render("social/new");
});

router.get("/:id",(req,res)=>{
    social.findById(req.params.id).populate("comments").exec((err,foundsocial)=>{
        if(err||!foundsocial){
            req.flash("error","Social Not Found Sorry! Please Refresh And Try Again");
            res.redirect("back");
        }else{
            res.render("social/show",{social:foundsocial}
                      );
        }
    });
});

router.get("/:id/edit",middleware.checksocialOwnership,(req,res)=>{
    social.findById(req.params.id,(err,foundsocial)=>{
res.render("social/edit",{social:foundsocial});
  });
});

router.put("/:id", upload.single('image'), function(req, res){
  social.findById(req.params.id, async function(err, social){
      if(err){
          req.flash("error", err.message);
          res.redirect("back");
      } else {
          if (req.file) {
            try {
                await cloudinary.v2.uploader.destroy(social.imageId);
                var result = await cloudinary.v2.uploader.upload(req.file.path);
                social.imageId = result.public_id;
                social.image = result.secure_url;
            } catch(err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
          }
          social.name = req.body.name;
          social.description = req.body.description;
          social.price=req.body.price;
          social.save();
          req.flash("success","Successfully Updated!  PLease Refresh If Not Visible");
          res.redirect("/socials/" + social._id);
      }
  });
});

router.delete('/:id', function(req, res) {
social.findById(req.params.id, async function(err, social) {
  if(err) {
    req.flash("error", err.message);
    return res.redirect("back");
  }
  try {
      await cloudinary.v2.uploader.destroy(social.imageId);
      social.remove();
      req.flash('success', 'Social Deleted Successfully! PLease Refresh If Not Visible');
      res.redirect('/socials');
  } catch(err) {
      if(err){
        req.flash("error", err.message);
        return res.redirect("back");}}});
});
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports=router;
