// 
// Node.js Server Code
// UMD CS 4995
//
// Code manages the traffic for whiteboards, along with webRTC video components of the interface.
//
// Message Types handled by the Server
// ==================================
//
// log client - 
// 
// Important information for using the socket.io classes:
// 
// TODO ---
//  Implement Loading Whiteboard
//  Emit to specific client/clients
//  Browser client for debugging?
// ---------

// Express is a JS web app system 
var app = require('express')(),	
    path = require('path'),	
    streams = require('./streams.js')();
    
var http = require('http').Server(app);
var mainListeningSocket = require('socket.io')(http);
require('dotenv').config();

var favicon = require('serve-favicon'),
	logger = require('morgan'),
	methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
	errorHandler = require('errorhandler');

//
// MySQL connection information
//
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

// Ideally, add all the handlers to an array
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

// GET streams as JSON
app.get('/streams.json', function(req, res) {
  var streamList = streams.getStreams();
  // JSON exploit to clone streamList.public
  var data = (JSON.parse(JSON.stringify(streamList))); 

  res.status(200).json(data);
});

// Array to hold the list of connected clients
// - Stores the clientSocket.id that can be used to emit messages back to those clients.
//
var clientList = [];      // array of the client ids
var whiteboardList = [];  // array of the whiteboards

// socket.io entry point
mainListeningSocket.on('connection', function(clientSocket){

	// Client has connected.
	console.log('client connected: client id=' + clientSocket.id);

	// Add the client socket identifier to the client array
	clientList.push(clientSocket);

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
		whiteboardList.push( whiteboardData.name );

		// Alert the client if the whiteboard was created.
		clientSocket.emit('response', { 'status': 100, 'message': 'Successful creation' });
	});

	// joinWhiteboard - Client Protocol Message
    // joins whitebaords by id
	clientSocket.on('joinWhiteboard', function(msg) {
		console.log('joinWhiteboard', msg);

		var whiteboardData = JSON.parse(msg);
		console.log('   name: ', whiteboardData.name);

		// Determine if this whiteboard exists

		// Alert the client if the whiteboard was joined.
		clientSocket.emit('response', { 'status': 100, 'message': 'Joined whiteboard' });
	});

	// Our test messages....
	//    chat message
	//    motion event
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

    // Event triggered by client drawing
	clientSocket.on('motionevent', function(msg) {

		// DB queries not yet reliable
		//    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
		//      if (err) throw err;
		//    });

		mainListeningSocket.emit('motionevent', msg);
		console.log('motionevent', msg);
	});
    
    clientSocket.emit('id', clientSocket.id);

    clientSocket.on('message', function (details) {
      var otherClient = io.sockets.connected[details.to];

      if (!otherClient) {
        return;
      }
        delete details.to;
        details.from = clientSocket.id;
        otherClient.emit('message', details);
    });
      
    clientSocket.on('readyToStream', function(options) {
      console.log('-- ' + clientSocket.id + ' is ready to stream --');
      
      streams.addStream(clientSocket.id, options.name); 
    });
    
    clientSocket.on('update', function(options) {
      streams.update(clientSocket.id, options.name);
    });

    //Handles all client disconnects
    //Removes clients from our own client list
    function leave() {
      console.log('Client left: ' + clientSocket.id);
      streams.removeStream(clientSocket.id);
    }

    clientSocket.on('disconnect', leave);
    clientSocket.on('leave', leave);

});
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//
//
var port = process.env.PORT || 3000
http.listen(port, function(){
	console.log('listening on *:' + port);
});

//connection.end();
