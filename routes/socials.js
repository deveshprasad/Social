const express=require("express");
const router=express.Router({mergeParams:true});
const social=require("../models/social");
const middleware=require("../middleware");
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



router.post("/",middleware.isLoggedIn,(req,res)=>{

  //  res.send("podstdhfjh"); to check in postman
 let name =req.body.name;
 let price=req.body.price;
 let image=req.body.image;
 let description=req.body.description;
 let author={
     id:req.user._id,
     username:req.user.username
 }
 let newsocial={
     name:name,
     price:price,
     image:image,
     description:description,
     author:author
 }
 social.create(newsocial,(err,newlyCreated)=>{
      if(err){
          console.log(err);
      }else{
        res.redirect("/socials");
      }
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
router.put("/:id",middleware.checksocialOwnership,(req,res)=>{
// find and update correct social
social.findByIdAndUpdate(req.params.id,req.body.social,(err,updatedsocial)=>{
  if(err){
      res.redirect("/socials");
  }else{
    res.redirect("/socials/"+req.params.id);
  }
});
//redirect somewhere
});



//DESTROY ROUTES
router.delete("/:id",middleware.checksocialOwnership,(req,res)=>{
social.findByIdAndDelete(req.params.id,(err,deleted)=>{
    if(err){
        res.redirect("/socials");
    }else{
      res.redirect("/socials");
    
    }
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports=router;