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

// TODO: Ideally, add all HTTP handlers to an array
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/streams.json', function(req, res) {
	var streamList = streams.getStreams();
	// JSON exploit to clone streamList.public
	var data = (JSON.parse(JSON.stringify(streamList))); 
	res.status(200).json(data);
});

// Array to hold the list of connected clients
var clientList = [];      // array of the client ids
var whiteboardMap = {};   // map of the whiteboards

// socket.io entry point
mainListeningSocket.on('connection', function(clientSocket){
	actions.addClient(clientList,clientSockets);
	clientSocket.emit('connection', clientSocket.id);

	clientSocket.on('createWhiteboard', function(msg) {
		actions.createWhiteboard(whiteboardMap, clientSocket, msg);
	});

	clientSocket.on('list', function(msg) {
		actions.listAllClients(clientList, clientSocket);
	});

	// joinWhiteboard - Client Protocol Message
	// joins whiteboards by id
	clientSocket.on('joinWhiteboard', function(msg) {
		actions.joinWhiteboard(whiteboardMap, clientSocket, msg)
	});

	// chat message - echoes the message to all connected clients
	clientSocket.on('chat message', function(msg){
		actions.chatMessage(mainListeningSocket, clientSocket, msg);
	});

	// motionevent - triggered by client drawing
	clientSocket.on('motionevent', function(msg) {

		// DB queries not yet reliable
		//    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
		//      if (err) throw err;
		//    });

		mainListeningSocket.emit('motionevent', msg);
		console.log('motionevent', msg);
	});

	// message - represents a direct message to another client
	// (currently only used by RTC)
	clientSocket.on('message', function (details) {
		var otherClient = io.sockets.connected[details.to];

		if (!otherClient) {
			return;
		}
		delete details.to;
		details.from = clientSocket.id;
		otherClient.emit('message', details);
	});

	// readyToStream - adds a client stream to the master stream list
	// (RTC only)
	clientSocket.on('readyToStream', function(options) {
		console.log('-- ' + clientSocket.id + ' is ready to stream --');

		streams.addStream(clientSocket.id, options.name); 
	});

	// update - updates a client stream on the master stream list
	// (RTC only)
	clientSocket.on('update', function(options) {
		streams.update(clientSocket.id, options.name);
	});


	//Handles all client disconnects
	//Removes clients from our own client list and from the video stream list
	clientSocket.on('disconnect', function(){
		actions.leave(streams, clientList, clientSocket);
	});
	clientSocket.on('leave', function(){
		actions.leave(streams, clientList, clientSocket);
	});
});


var port = process.env.PORT || 3000
http.listen(port, function(){
	console.log('listening on *:' + port);
});

// TODO: Here lies dead MySQL code
//connection.end();
