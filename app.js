
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();


app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
    res.sendFile('Moodify.html', { root:  'public' });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

module.exports = app;