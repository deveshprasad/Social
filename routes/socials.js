const express=require("express");
const router=express.Router({mergeParams:true});
const social=require("../models/social");
const middleware=require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only Image Files Are Allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dcsgaregd', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
router.get("/",(req,res)=>{
    var noMatch=null;
    // eval(require("local"));
    // //console.log(req.user);
   // get alll socials from db
   if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    social.find({name:regex},(err,social)=>{
        if(err){
            console.log(err);
        }else{
          
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

// Social.create({name:"A",
// image:"https://www.Socialingworld.co.uk/Images/Models/Full/2104.Jpg",
// description:"This sucks motherfucker you motherfucker"},
// (err,Social)=>{
//     if(err){
//         console.log(err)
//     }else{
//         console.log("NEwly created social");
//         console.log(Social);
//     }
// });



router.post("/",middleware.isLoggedIn, upload.single('image'),(req,res)=>{

  //  res.send("podstdhfjh"); to check in postman
//  let name =req.body.name;
//  let price=req.body.price;
//  let image=req.body.image;
//  let description=req.body.description;
//  let author={
//      id:req.user._id,
//      username:req.user.username
//  }
//  let newsocial={
//      name:name,
//      price:price,
//      image:image,
//      description:description,
//      author:author
//  }
//  social.create(newsocial,(err,newlyCreated)=>{
//       if(err){
//           console.log(err);
//       }else{
//         res.redirect("/socials");
//       }
//  });
cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
    if(err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    // add cloudinary url for the image to the campground object under image property
    req.body.social.image = result.secure_url;
    // add image's public_id to campground object
    req.body.social.imageId = result.public_id;
    // add author to campground
    req.body.social.author = {
      id: req.user._id,
      username: req.user.username
    }
    social.create(req.body.social, function(err, social) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/socials/' + social.id);
    });
  });
});

router.get("/new",middleware.isLoggedIn,(req,res)=>{
    res.render("social/new");
});

router.get("/:id",(req,res)=>{
    social.findById(req.params.id).populate("comments").exec((err,foundsocial)=>{
        if(err||!foundsocial){
            req.flash("error","Social Not Found Sorry! Please Refresh And Try Again");
            res.redirect("back");
        }else{
            console.log(foundsocial);
            res.render("social/show",{social:foundsocial});
        }
    });

});

//// EDIT social ROUTE
router.get("/:id/edit",middleware.checksocialOwnership,(req,res)=>{
    //////// is someone or user logged in
    social.findById(req.params.id,(err,foundsocial)=>{
     
      res.render("social/edit",{social:foundsocial});
    });

    });
//// UPDATE social
// router.put("/:id",middleware.checksocialOwnership,(req,res)=>{
// // find and update correct social
// social.findByIdAndUpdate(req.params.id,req.body.social,(err,updatedsocial)=>{
//   if(err){
//       res.redirect("/socials");
//   }else{
//     res.redirect("/socials/"+req.params.id);
//   }
// });
// //redirect somewhere
// });



// //DESTROY ROUTES
// router.delete("/:id",middleware.checksocialOwnership,(req,res)=>{
// social.findByIdAndDelete(req.params.id,(err,deleted)=>{
//     if(err){
//         res.redirect("/socials");
//     }else{
//       res.redirect("/socials");
    
//     }
//   });
// });
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
      if(err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
  }
});
});
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports=router;