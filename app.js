var express           =     require('express');
var  passport          =     require('passport')
var util              =     require('util');
  var FacebookStrategy  =     require('passport-facebook').Strategy;
  var TwitterStrategy  =     require('passport-twitter').Strategy;
 var GoogleStrategy  =     require('passport-google-oauth2').Strategy;
  var LinkedinStrategy  =     require('passport-linkedin').Strategy;

  var session           =     require('express-session');
  var cookieParser      =     require('cookie-parser');
  var bodyParser        =     require('body-parser');
  var config            =     require('./configuration/config');
  var  mysql             =     require('mysql');
  var  app               =     express();

//Define MySQL parameter in Config.js file.
var connection = mysql.createConnection({
  host     : config.host,
  user     : config.username,
  password : config.password,
  database : config.database
});

//Connect to Database only if Config.js parameter is set.

    connection.connect();
    


// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url1
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
    
      connection.query("SELECT * from user_info where user_id="+profile.id,function(err,rows,fields){
        if(err) throw err;
        if(rows.length===0)
          {
            console.log("There is no such user, adding now");

            connection.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.displayName+"')");
          }
          else
            {
              console.log("User already exists in database");
            }
          });
      
      return done(null, profile);
    });
  }
));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));


app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


//----------------------------------------------------------------------------


passport.use(new TwitterStrategy({
    "consumerKey":"7UrDSprdv5NhrsRGbSpWjY9hY",
    "consumerSecret":"GJcqtqGUqilUbDO7S5oNmVHGdYNDdD0p1sJBLhDQ4KM4khB2k0" ,
    "callbackURL": "http://localhost:3000/auth/twitter/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
    
      connection.query("SELECT * from  twit_user where user_id="+profile.id,function(err,rows,fields){
        if(err) throw err;
        if(rows.length===0)
          {
            console.log("There is no such user, adding now");
            
            connection.query("INSERT into twit_user(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
          }
          else
            {
              console.log("User already exists in database");
            }
          });
      
      return done(null, profile);
    });
  }
));

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
app.get('/login',function(req,res){
  res.send("please login");
});
//-------------------------------------------------------------------------------


passport.use(new GoogleStrategy({
    "clientID":"868801597079-igoslsrgeg25es87f46ivnbf41avka5u.apps.googleusercontent.com",
    "clientSecret":"wUOIEFo-mLRRs6hLCZXCrrpW" ,
    "callbackURL":"http://localhost:3000/auth/google/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
    
      connection.query("SELECT * from  google_user where user_id="+profile.id,function(err,rows,fields){
        if(err) throw err;
        if(rows.length===0)
          {
            console.log("There is no such user, adding now");
            
            connection.query("INSERT into google_user(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
          }
          else
            {
              console.log("User already exists in database");
            }
          });
      
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
    res.redirect('/');
  });

//-------------------------------------------------------------------------------------


passport.use(new LinkedinStrategy({
    "consumerKey":"81aj6znk48q4s5",
    "consumerSecret":"kURVId1SZAc3OOFP" ,
    "callbackURL":"http://localhost:3000/auth/linkedin/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
    
      connection.query("SELECT * from  linkedin_user where user_id="+profile.id,function(err,rows,fields){
        if(err) throw err;
        if(rows.length===0)
          {
            console.log("There is no such user, adding now");
            
            connection.query("INSERT into linkedin_user(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
          }
          else
            {
              console.log("User already exists in database");
            }
          });
      
      return done(null, profile);
    });
  }
));

app.get('/auth/linkedin', passport.authenticate('linkedin'));
app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


app.listen(3000);
