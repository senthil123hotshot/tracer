var express = require('express');
var mongodb = require('mongodb'),
MongoClient = mongodb.MongoClient;
var app = express();
var db;
var bodyparser=require('body-parser');
var jwt=require('jsonwebtoken');
 var  _ = require('lodash');
app.set('superSecret','thisismysecret');
app.use(bodyparser.urlencoded({ extended: false}));
app.use(bodyparser.json());
MongoClient.connect("mongodb://localhost/mytestl", function(err, database) {
  db = database;
  db.collection("textstore", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("textstore", function(err, result) {
      });
    }
    db.ensureIndex("textstore", {
      document: "text"
    }, function(err, indexname) {
    });
}); db.collection("login", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("login", function(err, result) {
      });
    }
});

db.collection("folders", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("folders", function(err, result) {
      });
    }
});
});

//----------------Registration api-----------------------------------------
app.post("/register", function(req, res) {
  db.collection('login').insert({
    UserName: req.body.UserName,
    password:req.body.password
  }, function(err, result) {
    if (err == null) {
      res.send({success:true,message:"Registered successfully completed"});
    } else {
      res.send({success:false,message:+err});
    }
  });
});
//------------------login api--------------------------------
app.post('/login', function(req, res){
  var email=req.body.email;
  var password=req.body.password;
db.collection('login').find( {UserName:email}, { UserName: 1} ).toArray(function(err, user){
if(user.length!=0){
db.collection('login').find( {password:password}, { password: 1} ).toArray(function(err, user1){
if(user1.length!=0)
{
           var token=jwt.sign(_.omit(user), app.get('superSecret'),{
            expiresIn:60*60*24
        });
          res.json({
            success: true,
            message:'token created',
            token:token   //token generation
          });  
       db.collection('login').update(
   { UserName: email },
   { $set: { User_token: token }}); //the token value store into the login collection.
}
else{
  res.send({success:false,"message":"Invalid Password"});
}
});
}
else{
  res.send({"success":false,"message":"Email not exist"});
}     
});
});  
//----------------------------forget password api---------------
app.post('/forgetpassword',function(req,res){
  var email=req.body.email;
  var NewPassword=req.body.NewPassword;
   db.collection('login').update(
   { UserName: email },
   { $set: { password: NewPassword }},function(err){
    if(err){
      res.send({success:false,message:'Password not updated'});
    }
    else
    {
      res.send({success:true,message:'New Password Updated successfully'});
    }
   }); 
});
//----------------------folder creation api.-----------------------------
app.post("/folderadd",function(req,res){
 var token=req.body.token || req.query.token || req.headers['x-access-token'];
 var folder_name=req.body.folder_name;
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.json({success:false, message:'failed to authendicate the tokens'});

      }else{
        
        req.decoded=decoded;
       
 // db.collection('login').find( { User_token: token }, { UserName: 1} ,function(err,email,callback){
  db.collection('folders').insert({
 //UserName:email,
  foldername:folder_name
},function(err){
  if(err){
  console.log(err);
      }
  else{
    res.send({success:true,"message":"The New Folder Created","FolderName":folder_name});
  }

});
  }
    });
  }else{
    return res.status(404).send({
      success:false,
      message:'no token provided'
    });
  }
});
//----------------------assumption for adding the data into database.------------------
app.post("/add", function(req, res) {
var token=req.body.token || req.query.token || req.headers['x-access-token'];
 var foldername=req.body.folder_name;
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{
        
        req.decoded=decoded;
  /*db.collection('login').find({
   User_token:token
}, {
    UserName: 1
},function(err,email){*/

   db.collection('textstore').insert({

    //UserName:email,
    FolderName:foldername,
    created: new Date(),
    link:req.body.link,
    document:req.body.document
  }, function(err, result) {
    if (err == null) {
      res.send({success:true,message:'document added'});
    } else {
      console.log(err);
      res.send({success:false,message:'failed to add the document'});
    }
  });
}
});
}
  else{
    res.send({success:true,message:"must provide the tokens"});
  }
}); 
//-------------------search api----------------------------
app.post("/search", function(req, res) {
var token=req.body.token || req.query.token || req.headers['x-access-token'];
 var foldername=req.body.folder_name;
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{ 
       req.decoded=decoded;
  db.collection('textstore').find({
    "$text": {
      "$search": req.body.query
    }
  }, {
    document: 1,
    created: 1,
    _id: 1,
    link: 1,
    FolderName: 1,
    
  }).toArray(function(err, items) {
    res.send(items);
  });
}
});
}
else{
    res.send({success:true,message:"must provide the tokens"});
  }
});
app.listen(3000);


