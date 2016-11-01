var express = require('express');
var app = express();
var path = require('path');
var expressCtrl = require('express-controllers-loader');
var LocalStrategy = require('passport-local').Strategy;
var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var bodyParser = require('body-parser');
var expressWs = require('express-ws')(app);
var session = require('express-session')
var busboy = require('connect-busboy');
var FileStore   = require('session-file-store')(session);

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(busboy());

app.use(session({
    store: new FileStore(),
    secret: 'zkr85ilO0yNG6AJRLnavLm6qBDGH0iS8',
    resave: false,
    saveUninitialized: true
}))

////////////
// GLOBAL //
////////////
var path = require('path');
global.rootPath = path.resolve(__dirname);


require(path.join(__dirname, 'core', 'authentification.js'));

app.use(passport.initialize());
app.use(passport.session());

tmS.init({
    config_path : path.join(__dirname, 'config', 'database.json'),
    models_path : path.join(__dirname, 'models')
});

expressCtrl.load(app, {
    verbose : true,
    preURL : '/api',
    permissions: require('./core/permissions'),
    controllers_path : path.join(__dirname, 'controllers')
});

app.ws('/te', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
    });
    console.log('socket', req.testing);
});

require(path.join(__dirname, 'helpers', 'prototype.js'))

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
