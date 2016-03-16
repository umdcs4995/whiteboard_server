// 
// Whiteboard server
// Codename 'Silver Surfer' (because we need a cool code name)
// UMD CS 4995
//
// Code manages the traffic for whiteboards, along with (web)RTC signalling.
// 
// TODO ---
//  Implement Loading Whiteboard
//  Emit to specific client/clients
//  Browser client for debugging?
//  Implement MySQL safely
// ---------

// Load configuration from .env file
require('dotenv').config();

var app = require('express')()
path = require('path'),	
 	 actions = require('./app/actions.js')(),
	 streams = require('./app/streams.js')(),
	 http = require('http').Server(app),
	 mainListeningSocket = require('socket.io')(http),
     rtc_handler = require('socket.io')(),
	 favicon = require('serve-favicon'),
	 logger = require('morgan'),
	 methodOverride = require('method-override'),
	 bodyParser = require('body-parser'),
	 errorHandler = require('errorhandler');

// MySQL connection information
var useMYSQL = false;
if (useMYSQL) {
	var mysql  = require('mysql');
	var connection = mysql.createConnection({
		host     : process.env.DB_HOST,
		user     : process.env.DB_USER,
		password : process.env.DB_PASS,
		database : 'hcc'
	});
	connection.connect();
}

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/streams.json', function(req, res) {
	var streamList = streams.getStreams();
	// JSON exploit to clone streamList.public
	var data = (JSON.parse(JSON.stringify(streamList))); 
	res.status(200).json(data);
});

// RTC socket.io handler - uses port 3001 if RTC_PORT is not defined in .env
// TODO: make secure?
var rtc_serv = require('http').createServer();
var rtc_io = require('socket.io')(rtc_serv);
var rtc_port = process.env.RTC_PORT || 3001;
rtc_serv.listen(rtc_port, function() {
    console.log('rtc server listening on *:' + rtc_port);
});
require('./app/rtc_handler.js')(rtc_io, streams);

// Array to hold the list of connected clients
var clientList = [];      // array of the client ids
var whiteboardMap = {};   // map of the whiteboards

// socket.io entry point
mainListeningSocket.on('connection', function(clientSocket){
	actions.addClient(clientList,clientSocket);
	clientSocket.emit('connection', clientSocket.id);

	clientSocket.on('createWhiteboard', function(msg) {
		actions.createWhiteboard(whiteboardMap, clientSocket, msg);
	});

	clientSocket.on('joinWhiteboard', function(msg) {
		actions.joinWhiteboard(whiteboardMap, clientSocket, msg)
	});

	// chat message - echoes the message to all connected clients
	clientSocket.on('chat message', function(msg){
		actions.chatMessage(mainListeningSocket, clientSocket, msg);
	});

	// motionevent - triggered by client drawing
	clientSocket.on('motionevent', function(msg) {
		actions.motionEvent(mainListeningSocket, msg);
	});

	//Handles all client disconnects
	//Removes clients from the client list
	clientSocket.on('disconnect', function(){
		actions.leave(clientList, clientSocket);
	});
    
	clientSocket.on('leave', function(){
		actions.leave(clientList, clientSocket);
	});

	clientSocket.on('list', function(msg) {
		actions.listAllClients(clientList, clientSocket);
	});
});

var port = process.env.PORT || 3000
http.listen(port, function(){
	console.log('whiteboard server listening on *:' + port);
});

// TODO: Here lies dead MySQL code
//connection.end();
