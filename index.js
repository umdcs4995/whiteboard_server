// 
// Whiteboard server
// Codename 'Silver Surfer' (because we need a cool code name)
// UMD CS 4995
//
// Code manages the traffic for whiteboards, along with (web)RTC signalling.
// 

// Load configuration from .env file
require('dotenv').config();

var app = require('express')(),
    path = require('path'),	
    http = require('http').Server(app),
    mainListeningSocket = require('socket.io')(http),
    rtc_handler = require('socket.io')(),
    favicon = require('serve-favicon'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler');

var streams = require('./app/streams.js')(),
    whiteboards = require('./app/whiteboards.js'),
    clients = require('./app/clients.js'),
    // change the 'false' to 'true' to get debug output
    logger = require('./app/logger.js')(false, true);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

// TODO: see logger.js
app.get('/log.txt', function(req, res){
	res.sendFile(__dirname + '/log/out.log');
});

app.get('/log.html', function(req, res){
	res.sendFile(__dirname + '/log.html');
}); 

app.get('/streams.json', function(req, res) {
	var streamList = streams.getStreams();
	// JSON exploit to clone streamList.public
	var data = (JSON.parse(JSON.stringify(streamList))); 
	res.status(200).json(data);
});

app.get('/whiteboards.json', function(req, res) {
    var wbList =  whiteboards.list();
    var data = (JSON.parse(JSON.stringify(wbList))); 
	res.status(200).json(data);
});

// TODO: remove - this is for debugging only
app.get('/clients.json', function(req, res) {
    var wbList = clients.list();
    var data = (JSON.parse(JSON.stringify(wbList))); 
	res.status(200).json(data);
});

// RTC socket.io handler - uses port 3001 if RTC_PORT is not defined in .env
// TODO: make secure?
var rtc_serv = require('http').createServer();
var rtc_io = require('socket.io')(rtc_serv);
var rtc_port = process.env.RTC_PORT || 3001;
rtc_serv.listen(rtc_port, function() {
    logger.log('rtc server listening on *:' + rtc_port);
});
require('./app/rtc_handler.js')(rtc_io, streams);

// Client socket handler - uses port 3000 if PORT is not defined in .env
var port = process.env.PORT || 3000
http.listen(port, function(){
	logger.log('whiteboard server listening on *:' + port);
});
require('./app/client_handler.js')(mainListeningSocket, whiteboards, clients, logger);