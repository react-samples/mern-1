"use strict";

var http = require('http');
var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var fileUpload = require('express-fileupload');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var User = require('./schema/User');
var Message = require('./schema/Message');

var app = express();

mongoose.connect('mongodb://localhost:27017/chatapp',function(err){
  if(err){
     console.error(err);
  }else{
     console.log("successfully connected to MongoDB.");
  }
});

app.use(bodyparser())

app.use(session({ secret: 'HogeFuga' }));
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use("/image", express.static(path.join(__dirname, 'image')));
app.use("/avatar", express.static(path.join(__dirname, 'avatar')))

app.get("/",function(req, res, next) {
  Message.find({}, function(err, msgs){
    if(err) throw err;
    return res.render('index', {
      messages: msgs,
      user: req.session && req.session.user ? req.session.user : null
    });
  })
});

app.get("/signin", function(req, res, next) {
  return res.render('signin');
});

app.post("/signin", fileUpload(), function(req, res, next){

  var avatar = req.files.avatar
  avatar.mv('./avatar/' + avatar.name, function(err){
    if(err) throw err
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      avatar_path: '/avatar/' + avatar.name
    })
    newUser.save((err)=>{
      if(err) throw err
      return res.redirect("/")
    })
  })
})

app.get("/login", function(req, res, next) {
  return res.render('login')
});

app.post('/login', passport.authenticate('local'),function(req, res, next) {
    User.findOne({_id: req.session.passport.user},function(err, user){
      if(err||!req.session) return res.redirect('/login')

      req.session.user = {
          username: user.username,
          avatar_path: user.avatar_path
      }
      return res.redirect("/")
    })
  }
);

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({_id: id}, function(err, user) {
    done(err, user);
  });
});

app.get("/update", function(req, res, next) {
  return res.render('update');
});

app.post("/update",fileUpload(), function(req, res, next) {


  if(req.files && req.files.image) {
    req.files.image.mv('./image/' + req.files.image.name, function(err){
      if(err) throw err;
      var newMessage = new Message({
        username: req.session.user.username,
        message: req.body.message,
        image_path: '/image/' + req.files.image.name
      });
      newMessage.save((err)=>{
        if(err) throw err;
        return res.redirect("/");
      });
    });
  }else{
    var newMessage = new Message({
      username: req.body.username,
      message: req.body.message
    });
    newMessage.save((err)=>{
      if(err) throw err;
      return res.redirect("/");
    });
  }
});

var server = http.createServer(app);
server.listen('3000');
