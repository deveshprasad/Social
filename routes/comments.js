const express=require("express");
const router=express.Router({mergeParams:true});
const social=require("../models/social");
const Comment=require("../models/comment");
const middleware=require("../middleware");


router.get("/new",middleware.isLoggedIn,(req,res)=>{
    social.findById(req.params.id,(err,social)=>{
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{social:social});

        }
    })
});

router.post("/",middleware.isLoggedIn,(req,res)=>{
  
// look social uisng id
social.findById(req.params.id,(err,social)=>{
  if(err){
    req.flash("error","Something went wrong");
      console.log(error);
     
  }else{
    Comment.create(req.body.comment,(err,comment)=>{
        if(err){
            console.log(err);
        }else{////\ addd usernmae and id to comment then save
            comment.author.id=req.user._id;
            comment.author.username=req.user.username;
           comment.save();
            social.comments.push(comment);
            social.save();
            console.log(comment);
            req.flash("success","Successfully Added Comments");
            res.redirect("/socials/"+social._id);
        }
    });
      //Comment.create
 }
});
// create new comment 
// connecct new comment to Socialgrouund
// redirect social show page
});

router.get("/:comment_id/edit",middleware.checkCommentOwnership,(req,res)=>{
    social.findById(req.params.id,(err,foundsocial)=>{
        if(err||foundsocial){
            req.flash("error","Cannot find it");
            console.log(err);
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id,(err,foundComment)=>{
            if(err){
                res.redirect("back");
            }else{
                res.render("comments/edit",{social_id:req.params.id,comment:foundComment});
            }
           });
    });

});

router.put("/:comment_id",middleware.checkCommentOwnership,(req,res)=>{
Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,(err)=>{
if(err){
    res.redirect("back");
}else{
    res.redirect("/socials/"+req.params.id);
}
});
});
router.delete("/:comment_id",middleware.checkCommentOwnership ,(req,res)=>{
    Comment.findByIdAndDelete(req.params.comment_id,(err,deleted)=>{
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Comment Deleted");
          res.redirect("/socials/"+req.params.id);
        
        }
      });
    });
    



module.exports=router;