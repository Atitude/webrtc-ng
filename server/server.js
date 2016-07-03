'use strict';
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');

const certificados = {
    key: fs.readFileSync(__dirname +'/privatekey.key'),
    cert: fs.readFileSync(__dirname +'/certificate.crt')
};

app.use(compression());
app.use(express.static('app'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var server = http.createServer(app);
var httpsServer = https.createServer(certificados, app);

app.use('/api', require('./api-routes'));


var signaling = require('./signaling.js')(httpsServer);
var port = process.env.PORT || 81;
var httpsPort = process.env.HTTPS_PORT || 443;
server.listen(port, function () {
    console.log("Servidor web rodando na porta "+port);
});

httpsServer.listen(httpsPort, function() {
    console.log("Servidor HTTPS rodando na porta "+httpsPort);
});