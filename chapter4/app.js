"use strict";

var http = require('http');
var path = require('path');
var express = require('express');

var app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get("/",function(req, res, next) {
  return res.render('index', {title: 'Hello World'});
});

var server = http.createServer(app);
server.listen('3000');
