"use strict";

var http = require('http');
var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var fileUpload = require('express-fileupload');

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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use("/image", express.static(path.join(__dirname, 'image')));

app.get("/",function(req, res, next) {
  Message.find({}, function(err, msgs){
    if(err) throw err;
    return res.render('index', {messages: msgs});
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
        username: req.body.username,
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


