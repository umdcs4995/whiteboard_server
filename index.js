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
// TODO------------------------------------------------------------------------------------------------------------------
//  Implement Loading Whiteboard
//  Emit to specific client/clients
// 
// ----------------------------------------------------------------------------------------------------------------------

// Express is a JS web app system 
var app = require('express')();
var http = require('http').Server(app);
var mainListeningSocket = require('socket.io')(http);
require('dotenv').config();

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

// Array to hold the list of connected clients
// - Stores the clientSocket.id that can be used to emit messages back to those clients.
//
var clientList = [];      // array of the client ids
var whiteboardMap = {};  // array of the whiteboards

// ======================================================================================
// Main Listening Socket - for use in making a connection between a client and the server
// ======================================================================================

mainListeningSocket.on('connection', function(clientSocket){

	// Client has connected.
	console.log('client connected: client id=' + clientSocket.id);

	// Add the client socket identifier to the client array
	clientList.push(clientSocket);

	// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
	// createWhiteboard - Client Protocol Message
  //
  //  
	clientSocket.on('createWhiteboard', function(msg) {

		console.log('createWhiteboard', msg);

		var whiteboardData = JSON.parse(msg);

		console.log('   name: ', whiteboardData.name);

		// Some of our message parameters may be optional. For
		// instance,
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

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------------
	// joinWhiteboard - Client Protocol Message
  //
  //  
	clientSocket.on('joinWhiteboard', function(msg) {
		console.log('joinWhiteboard', msg);

		var whiteboardData = JSON.parse(msg);
		console.log('   name: ', whiteboardData.name);

		// Determine if this whiteboard exists

		// Alert the client if the whiteboard was joined.
		clientSocket.emit('response', { 'status': 100, 'message': 'Joined whiteboard' });
	});


	// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
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

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //
  //
	clientSocket.on('motionevent', function(msg) {

		// DB queries not yet reliable
		//    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
		//      if (err) throw err;
		//    });

		mainListeningSocket.emit('motionevent', msg);
		console.log('motionevent', msg);
	});

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //Handles all client disconnects
  //Removes clients from our own client list
  //
  clientSocket.on('disconnect', function(msg){

  });
});
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//
//
var port = process.env.PORT || 3000
http.listen(port, function(){
	console.log('listening on *:' + port);
});

//connection.end();
