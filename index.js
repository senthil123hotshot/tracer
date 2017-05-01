var express = require('express');
var nodemailer=require('nodemailer');
var shortid = require('shortid');
var metaget = require("metaget");
var request=require("request");
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

var GeneralEmail;
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
      FolderID: "text",
      
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
});
db.collection("otp", {}, function(err, coll) {
    if (err != null) {
      db.createCollection("otp", function(err, result) {
      });
    }
});
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
//---------------------------------------------------------

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
 if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.json({success:false, message:'failed to authendicate the tokens'});

      }else{
        
        req.decoded=decoded;          
    db.collection('textstore').update(
   { FolderName:folderoldername  },
   { $set: { FolderName: foldernewname }},function(err){
    if(err){
      res.send({success:false,message:'FolderName not updated'});
    }
    else
    {
      res.send({success:true,message:'New FolderName Updated successfully'});
    }
   });
  }
})
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
  db.collection('textstore').find( {FolderName:folder_name}, { FolderName: 1} ).toArray(function(err, fname){
 if(fname.length==0){
         
   db.collection('textstore').insert({
    FolderName:folder_name,
    created: new Date(),
    FolderID:id,
  }, function(err, result) {
    if (err == null) {
      res.send({success:true,message:'Folder added'});
    } else {
      console.log(err);
      res.send({success:false,message:'failed to add the Folder'});
    }
  });

  }
  else{
        res.send({success:false,message:'Folder already exist'});
  }
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

db.collection('textstore').find({},{FolderID:1,FolderName:1,created:1,_id:0}).sort({created:-1}).limit(3).toArray(function(err,display){
if(err){
  console.log(err);
  res.send({success:false,message:"can not display the folders"});
}
{
  res.send({success:true,message:"folderdisplay","myfolder":display})
}
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

//-------------------get all the folders-------------------------
app.post('/moredisplay',function(req,res){
 var token=req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.json({success:false, message:'failed to authendicate the tokens'});
      }else{  
        req.decoded=decoded; 

db.collection('textstore').find({},{FolderID:1,FolderName:1,created:1,_id:0}).toArray(function(err,display){
if(err){
  console.log(err);
  res.send({success:false,message:"can not display the folders"});
}
{
  res.send({success:true,message:"folderdisplay","myfolder":display})
}
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
 var FolChoose=req.body.FolChoose;
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{
    //db.textstore.update({FolderID:12334},{$addToSet:{details:{$each: [{created:"s411111s",link:"41115dd",document:"s451111s"}]}}})
       
//---------meta data capture-------------
/*var input=req.body.input;
metaget.fetch(input, function (err, meta_response) {  
    if(err){
        console.log(err);
    }else{
     var link1={
        "value":meta_response,
        "link":input  
      };
        req.decoded=decoded;*/ 

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
 db.collection('general').insert({
  Content_id:val,
   created: TimeUTC,
    link:req.body.link,
    document:req.body.document
  },function(err){
    if(err){
      res.send({success:false,message:'Data is not added'});
      console.log(err);
    }
    else
    {
      res.send({success:true,message:'Data added to general catagory'});
      console.log(link1.value.description);

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
//-----------------content move-------------------
app.post("/contenthold",function(req,res){
var 
});




//-----------------------------general display -----------------
app.post('/generaldisplay',function(req,res){
  var token=req.body.token || req.query.token || req.headers['x-access-token'];
 var id=req.body.FolderID;
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{
        req.decoded=decoded;       
db.collection('general').find({},{created:1,link:1,document:1,_id:0}).toArray(function(err,gendata){
    if(err){
      res.send({success:false,message:'No General Data is not added'});
      console.log(err);
    }
    else
    {
      res.send({success:true,message:'Data added to general catagory',"general":gendata});
    }
  });
}
});
}
else{
    res.send({success:false,message:"must provide the tokens"});
  }
});
//-------------------search by click api----------------------------
app.post("/searchByClick", function(req, res) {
var token=req.body.token || req.query.token || req.headers['x-access-token'];
 //var foldername=req.body.folder_name;
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{ 
       req.decoded=decoded;
  db.collection('textstore').find({
    "$text": {
      "$search": req.body.FolderID
    }
  } ,{
    _id: 0,
    details:1,  
  }).toArray(function(err, items) {
    if(err){
        console.log(err);}
        else
        {
             res.send({success:true,"content":items});
            
/*
const publicIp = require('public-ip'); 
publicIp.v4().then(ip => {
    console.log("this is my ip"+ip);   
    var satelize = require('satelize');
satelize.satelize({ip:ip}, function(err, payload) {
                  console.log(JSON.stringify(payload.country.en));
                  console.log(JSON.stringify(payload.timezone));

var now=new Date();
var TimeUTC=now.toUTCString();
console.log(TimeUTC);
      var date = new Date(TimeUTC);
console.log(date.toString());
*/

}
}); 
}
});
}
else{
    res.send({success:false,message:"must provide the tokens"});
  }
});
//---------------------search by keyword---------------------------------
app.post("/searchByKey", function(req, res) {
var token=req.body.token || req.query.token || req.headers['x-access-token'];
 
  if(token){
    jwt.verify(token,app.get('superSecret'), function(err,decoded){
      if(err){
        return res.send({success:false, message:'failed to authendicate the tokens'});
      }else{ 
       req.decoded=decoded;
  db.collection('textstore').find({
    "$text": {
      "$search": req.body.keyword
    }
  }, {
    
    _id: 0,
    created: 1,
    details:1,  
  }).toArray(function(err, items) {
    res.send({success:true,"content":items});
  });
}
});
}
else{
    res.send({success:false,message:"must provide the tokens"});
  }
});
//----------------------------------------------------------------
app.listen(3000);

