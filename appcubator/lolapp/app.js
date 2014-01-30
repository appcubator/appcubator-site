#!/usr/bin/env node
var express = require('express')
  , http = require('http')
  , path = require('path');


var app = express();

app.configure(function(){
  app.set('port', (process.argv.length >= 3) ? parseInt(process.argv[2]) : (process.env.PORT || 3000));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  // TODO decide on an official path for the favicon
  // app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.cookieParser('some secret'));
  app.use(express.cookieSession());
  // app.use(express.csrf());
  app.use('/static', express.static(path.join(__dirname, 'static')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


var routes = require('./routes');
routes.bindTo(app);

app.listen(app.get('port'));
