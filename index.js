var express = require('express');
var nodemailer=require('nodemailer');
var shortid = require('shortid');
var metaget = require("metaget");
var request=require("request");
var  passport          =     require('passport')
var util              =     require('util');
  var FacebookStrategy  =     require('passport-facebook').Strategy;
  var TwitterStrategy  =     require('passport-twitter').Strategy;
 var GoogleStrategy  =     require('passport-google-oauth2').Strategy;
  var LinkedinStrategy  =     require('passport-linkedin').Strategy;
var session           =     require('express-session');
  var cookieParser      =     require('cookie-parser');


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
app.use(cookieParser());
//app.use(session({ secret: 'keyboardcat', key: 'sid'}));
app.use(session({
    secret:"mysecreat",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
var GeneralEmail;
var User;

//this is for the angularjs that will run only by the globelly.if you add the following code it will run locally

app.all('*', function(req, res,next) {


    /**
     * Response settings
     * @type {Object}
     */
    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };

    /**
     * Headers
     */
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }


});

MongoClient.connect("mongodb://localhost/mytestl", function(err, database) {
  db = database;
  db.collection("textstore", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("textstore", function(err, result) {
      });
    }
    db.ensureIndex("textstore", {
      "details.document": "text",
      
    }, function(err, indexname) {
    });
}); db.collection("login", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("login", function(err, result) {
      });
    }
    db.createIndex("login" ,{ "UserName": 1 }, { unique: true } );
});

db.collection("general", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("general", function(err, result) {
      });
    }
db.ensureIndex("general", {
      "details.document": "text",
      
    }, function(err, indexname) {
    });
});
db.collection("folders", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("folders", function(err, result) {
      });
    }
});
db.collection("otp", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("otp", function(err, result) {
      });
    }
});
});
        //----------------login via social media------------------
        // Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

//using facebook--------------------

passport.use(new FacebookStrategy({
    "clientID": "1438177266224635",
    "clientSecret":"decd84f0c73c7afb1cbe7fe8978ed93f",
    "callbackURL": "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

//when click the facebook icon in the login page..........
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.send("home page open");//here load the our home page

  });
app.get('/login', function(req, res){
  res.send("login page");
});
//login via twitter-------------
passport.use(new TwitterStrategy({
    "consumerKey":"7UrDSprdv5NhrsRGbSpWjY9hY",
    "consumerSecret":"GJcqtqGUqilUbDO7S5oNmVHGdYNDdD0p1sJBLhDQ4KM4khB2k0" ,
    "callbackURL": "http://localhost:3000/auth/twitter/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));
//when click the twitter icon---------------
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.send('/');
  });
app.get('/login',function(req,res){
  res.send("please login");
});
//login via gmail------------------
passport.use(new GoogleStrategy({
    "clientID":"868801597079-igoslsrgeg25es87f46ivnbf41avka5u.apps.googleusercontent.com",
    "clientSecret":"wUOIEFo-mLRRs6hLCZXCrrpW" ,
    "callbackURL":"http://localhost:3000/auth/google/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));
app.get('/auth/google', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read'] 
}));
app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.send("home page login");
  });
app.get('/login',function(req,res){
  res.send("please login");
});
//login via linked in----------------

passport.use(new LinkedinStrategy({
    "consumerKey":"81aj6znk48q4s5",
    "consumerSecret":"kURVId1SZAc3OOFP" ,
    "callbackURL":"http://localhost:3000/auth/linkedin/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {    
      return done(null, profile);
    });
  }
));
app.get('/auth/linkedin', passport.authenticate('linkedin'));
app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.send('home page load');
  });
app.get('/login',function(req,res){
  res.send("please login");
});
//signup api----------------------------
//------------------------------send the otp---------------------------
app.post('/sendotp',function(req,res){
  var val = Math.floor(1000 + Math.random() * 9000);
  var n=val.toString();
  var PhoneNo=req.body.PhoneNo;
  console.log(PhoneNo);
  var url="https://control.msg91.com/api/sendhttp.php?authkey=93907AcKTgFOlx560e23a3&mobiles=";
  var add1=url.concat(PhoneNo);
  
  var add2="&message=your OTP for INSENSE registeration is:"
  var add3=add1.concat(add2);
  var add5=add3.concat(n);
  var add4="&sender=indias&route=4";
  var final=add5.concat(add4);
  
  request(final, function (error, response, body) {
  
  res.send({"success":true,"message":"OTP send to the registered Phoneno"});
  db.collection("otp").insert({
    otpnumber:n,
    mobile:PhoneNo
  }),function(err){
    if(err){
      console.log(err);
    }
  }
});
});
//-------------------verify OTP-------------

app.post("/verifyotp",function(req,res){
  var userotp=req.body.userotp;
  console.log(userotp);
  db.collection('otp').find( {otpnumber:userotp}, { otpnumber: 1} ).toArray(function(err, user){
    if(user.length!=0){
    db.collection('login').insert({
    PhoneNo:req.body.PhoneNo,
    UserName: req.body.email,
    password:req.body.password,
    registerDate:new Date()
  }, function(err, result) {
    if (err == null) {
      res.send({success:true,message:"Registered successfully completed"});
    } else {
      res.send({success:false,message:"User already exist"});
    }
  });
    }
    else{
      res.send({"success":false,"message":"otp failed"});
    }
});
});
//------------------login api--------------------------------
app.post('/login', function(req, res){
  var email=req.body.email;
  var loged;
  var password=req.body.password;
db.collection('login').find( {UserName:email}, { UserName: 1} ).toArray(function(err, user){
if(user.length!=0){
db.collection('login').find( {password:password}, { password: 1} ).toArray(function(err, user1){
if(user1.length!=0)
{
           var token=jwt.sign(_.omit(user), app.get('superSecret'),{
            expiresIn:60*60*24
        });     
     

       db.collection('login').update(
   { UserName: email },
  { $set: { User_token: token}}); //the token value store into the login collection.

       res.send({success:true,message:"Login success","LoginTime":loged,"UserName":email,"token":token});

db.collection('folders').find({UserName:email},{UserName:1,_id:0}).toArray(function(err,result){
console.log(result.length);
if(result.length==0)
db.collection('folders').insert({UserName:email},function(err,result){
  console.log(email);
});
});
db.collection('general').find({UserName:email},{UserName:1,_id:0}).toArray(function(err,result){
console.log(result.length);
if(result.length==0)
db.collection('general').insert({UserName:email},function(err,result){
  console.log(email);
});
});
db.collection('otp').find({UserName:email},{UserName:1,_id:0}).toArray(function(err,result){
if(result.length==0)
db.collection('otp').insert({UserName:email},function(err,result){});
});
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

// Send the URL link to User regsitered email id----------------

app.post('/sendlink', function(req, res, next) {
 GeneralEmail= req.body.email;
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'senthil111itworld@gmail.com',
            pass: 'Senthil123'
        }
    });

  var mailOptions = {
      from: 'senthil <senthil111itworld@gmail.com>',
      to: GeneralEmail,
      subject: 'password verification',
      html: ' <a href="http://localhost:8000/#!/forgetpass">click here to set the password</a> '
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
          res.redirect('/');
      } else {
          console.log('message Sent: ' + info.response);
          res.send({success:true,message:'verification link sent to the email id'});

      }
  });
});
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
      
      //res.redirect('/login');
    }
   });
});  

//------------------folderrename---------------------------
app.post("/folderrename",function(req,res){
 var token=req.body.token || req.query.token || req.headers['x-access-token'];
 var folderoldername=req.body.folderoldername;
 var foldernewname=req.body.foldernewname;
 console.log(foldernewname);
 if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.json({success:false, message:'failed to authendicate the tokens'});

      }else{
        req.decoded=decoded;
    db.collection('login').find({User_token:token},{UserName:1,_id:0}).toArray(function(err,UserName1){
    db.collection('folders').find({UserName:UserName1[0].UserName},{UserName:1,_id:0}).toArray(function(err,result){
      db.collection('folders').update({
        "Folders.FolderName":folderoldername,
      },{$set :{
        "Folders.$.FolderName":foldernewname
      }},function(err,rese){
        if(err){
          res.send("error");
        }
        else{
          res.send({success:true,message:"updated"})
        }
      });
});  
    });
  }
});
  }
  else{
    return res.status(404).send({
      success:false,
      message:'no token provided'
    });
  }
});
//----------------------folder creation api.-----------------------------
app.post("/folderadd",function(req,res){
 var token=req.body.token || req.query.token || req.headers['x-access-token'];

 var folder_name=req.body.folder_name;
 console.log(folder_name);
 var id=shortid.generate();
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.json({success:false, message:'failed to authendicate the tokens'});

      }else{
        
        req.decoded=decoded;

    db.collection('login').find({User_token:token},{UserName:1,_id:0}).toArray(function(err,UserName){
  db.collection('folders').find( {UserName:UserName[0].UserName}, { UserName:1,_id:0} ).toArray(function(err, UserName1){     
   db.collection('folders').update({
    UserName: UserName1[0].UserName} ,{$addToSet:{Folders:{$each: [{
     FolderID:id,
     FolderName:folder_name,
     created:new Date()
   }]}
  }},function(err){
    if(err){
      res.send({success:false,message:'Folder is not created'});
      console.log(err);
    }
    else
    {
      res.send({success:true,message:'Folder is created'});
      db.collection('textstore').find({FolderID:id},{FolderID:1,_id:0}).toArray(function(err,result){
        if(result.length==0){
      db.collection('textstore').insert({FolderID:id},function(err,resul){});
    }
    });
  };
});
});
});
  }
});  
}
  else{
    return res.status(404).send({
      success:false,
      message:'no token provided'
    });
  }
});
//-------------------------------top folder display------------------
app.post('/topfolderdisplay',function(req,res){
  var token=req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.json({success:false, message:'failed to authendicate the tokens'});
      }else{  
        req.decoded=decoded; 
db.collection('login').find({User_token:token},{UserName:1,_id:0}).toArray(function(err,UserName){
db.collection('folders').find( {UserName:UserName[0].UserName}, { UserName:1,_id:0} ).toArray(function(err, username){
db.collection('folders').find({UserName:username[0].UserName},{Folders:1,_id:0}).sort({"Folders.created":-1}).limit(2).toArray(function(err,display){
if(err){
  console.log(err);
  res.send({success:false,message:"can not display the folders"});
}
else
{
  console.log(display);
  res.send({success:true,message:"folderdisplay","myfolder":display[0].Folders})
}
});
});
});
  }
});
  }
  else{
    return res.status(404).send({
      success:false,
      message:'no token provided'
    });
  }
});
//-------------------------------folder display------------------
app.post('/folderdisplay',function(req,res){
  var token=req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.json({success:false, message:'failed to authendicate the tokens'});
      }else{  
        req.decoded=decoded; 
 db.collection('login').find({User_token:token},{UserName:1,_id:0}).toArray(function(err,UserName){
  db.collection('folders').find( {UserName:UserName[0].UserName}, { UserName:1,_id:0} ).toArray(function(err, username){
db.collection('folders').find({UserName:username[0].UserName},{Folders:1,_id:0}).toArray(function(err,display){
if(err){
  console.log(err);
  res.send({success:false,message:"can not display the folders"});
}
{
  res.send({success:true,message:"folderdisplay","myfolder":display[0].Folders});
}
});
});
});
  }
});
  }
  else{
    return res.status(404).send({
      success:false,
      message:'no token provided'
    });
  }
});

//----------------------assumption for adding the data into database.------------------
app.post("/addContent", function(req, res) {
var token=req.body.token || req.query.token || req.headers['x-access-token'];
 var FolChoose=req.body.FolChoose;//folderid as the input
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{
req.decoded=decoded;  
var val = Math.floor(1000 + Math.random() * 9000); 
if(FolChoose==true){  
db.collection('textstore').update({
    FolderID: req.body.FolderID} ,{$addToSet:{details:{$each: [{
    Content_id:val,
    created: new Date(),
    link:req.body.link,
    document:req.body.document}]}
  }},function(err){
    if(err){
      res.send({success:false,message:'Data is not added'});
      console.log(err);
    }
    else
    {
      res.send({success:true,message:'Data added'});
    }
  });
}
else{
   db.collection('login').find({User_token:token},{UserName:1,_id:0}).toArray(function(err,UserName1){
  db.collection('general').find({UserName:UserName1[0].UserName},{UserName:1,_id:0}).toArray(function(err,result){
 if(result.length==0){
res.send("error");}
else{
db.collection('general').update({
  UserName:result[0].UserName
},{$addToSet:{details:{$each: [{
    Content_id:val,
    created: new Date(),
    link:req.body.link,
    document:req.body.document}]}
  }},function(err){
    if(err){
      res.send({success:false,message:'Data is not to general catagory added'});
      console.log(err);
    }
    else
    {
      res.send({success:true,message:'Data added to General'});
    }
  });
}
});
});
}
}
  });
}
else{
    res.send({success:false,message:"must provide the tokens"});
  }
}); 
//-----------------------------general display(without the folder)-----------------
app.post('/generaldisplay',function(req,res){
  var token=req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{
        req.decoded=decoded;  
db.collection('login').find({User_token:token},{UserName:1,_id:0}).toArray(function(err,userName){
  console.log(userName);
db.collection('general').find({UserName:userName[0].UserName},{details:1,_id:0}).toArray(function(err,gendata){
    if(err){
      res.send({success:false,message:'empty'});
      console.log(err);
    }
    else
    {
      res.send({success:true,message:'the general data',"general":gendata[0].details});
    }
  });
});
}
});
}
else{
    res.send({success:false,message:"must provide the tokens"});
  }
});
//---------------------search by click the folder---------------------------------
app.post("/searchByClick", function(req, res) {
var token=req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{ 
       req.decoded=decoded;
  db.collection('textstore').find({
    FolderID:req.body.FolderID
  },{_id:0,details:1}).toArray(function(err, items) {
    if (err) {console.log(err);}
    else{
       res.send({success:true,"content":items[0].details});
       console.log(items);
       }
  });
}
});
}
else{
    res.send({success:false,message:"must provide the tokens"});
  }
});
//------------------------search by the search bar----------------------
app.post("/searchByBar", function(req, res) {
  //var FolChoose=req.body.FolChoose;
  var FolChoose=true;
var token=req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{ 
       req.decoded=decoded;
       if(FolChoose==true){
  db.collection('textstore').find({$text: {$search:req.body.keyword}},{_id:0,details:1})
  .toArray(function(err, items) {
    if (err) {console.log(err);}
    else{
       res.send({success:true,"content":items[0].details});
       }
  });
}
else{
   db.collection('general').find({$text: {$search:req.body.keyword}},{_id:0,details:1}).toArray(function(err, items) {
    if (err) {console.log(err);}
    else{
       res.send({success:true,"content":items[0].details});
       }
  });
}
}
});
}
else{
    res.send({success:false,message:"must provide the tokens"});
  }
});
app.listen(3000);

