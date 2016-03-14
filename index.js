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
    streams = require('./streams.js')(),
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

	// Client has connected.
	console.log('client connected: client id=' + clientSocket.id);

	// Add the client socket identifier to the client array
	clientList.push(clientSocket);
    
    // Emit the id back to the client so they know what their id is
    // (currently only used by RTC code)
    clientSocket.emit('id', clientSocket.id);

	// createWhiteboard
    // creates a whiteboard with info from JSON data
	clientSocket.on('createWhiteboard', function(msg) {

		console.log('createWhiteboard', msg);

		var whiteboardData = JSON.parse(msg);

		console.log('   name: ', whiteboardData.name);

		// Some of our message parameters may be optional. 
        // For instance,
		if (whiteboardData.access !== undefined) {
			// the access member was sent in the message so process it
			// appropriately
			console.log('   access: ', whiteboardData.access);
		}

		// Verify if the whiteboard can be created 
		whiteboardMap[whiteboardData.name] = whiteboardData;

		// Alert the client if the whiteboard was created.
		clientSocket.emit('response', { 'status': 100, 'message': 'Successful creation' });
	});

	// joinWhiteboard - Client Protocol Message
    // joins whiteboards by id
	clientSocket.on('joinWhiteboard', function(msg) {
		console.log('joinWhiteboard', msg);

		var whiteboardData = JSON.parse(msg);
		console.log('   name: ', whiteboardData.name);

		// Determine if this whiteboard exists

		// Alert the client if the whiteboard was joined.
		clientSocket.emit('response', { 'status': 100, 'message': 'Joined whiteboard' });
	});

    // chat message - echoes the message to all connected clients
	clientSocket.on('chat message', function(msg){

		// No DB Stuff yet...
		//    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
		//      if (err) throw err;
		//    });

		console.log('Received chat message id=' + clientSocket.id + ', msg=' + msg);

		// Because this goes out the main socket, all clients will get it...
		mainListeningSocket.emit('chat message', msg);

		// this may be another way to send to all connected sockets:
		// mainListeningSocket.sockets.emit('messagename', 'message');
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
    function leave() {
      console.log('Client left: ' + clientSocket.id);
      streams.removeStream(clientSocket.id);
    }

    clientSocket.on('disconnect', leave);
    clientSocket.on('leave', leave);
});


var port = process.env.PORT || 3000
http.listen(port, function(){
	console.log('listening on *:' + port);
});

// TODO: Here lies dead MySQL code
//connection.end();
