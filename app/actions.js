module.exports = function(){
	return {
		listAllClients : function (clientList, clientSocket){
			var str = "";
			clientList.forEach(function(c){
				str += c.id + " ";
			});
			clientSocket.emit('list', str);
		},

		addClient : function(clientList, clientSocket){
			// Client has connected.
			console.log('client connected: client id=' + clientSocket.id);

			// Add the client socket identifier to the client array
			clientList.push(clientSocket);
			// Emit the id back to the client so they know what their id is
			// (currently only used by RTC code)
			clientSocket.emit('connection', clientSocket.id);
		},

		// createWhiteboard
		// creates a whiteboard with info from JSON data
		createWhiteboard : function(whiteboardMap, clientSocket, msg){
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
				clientSocket.emit('createWhiteboard', { 'status': 100, 'message': 'Successful creation' });
		},

		joinWhiteboard : function(whiteboardMap, clientSocket, msg){
			console.log('joinWhiteboard', msg);

			var whiteboardData = JSON.parse(msg);
			console.log(msg);
			console.log('   name: ', whiteboardData.name);

			// Determine if this whiteboard exists
			if(whiteboardMap[whiteboardData.name]==null){
				clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': whiteboardData.name + ' does not exsist'})
			}else{
				// Alert the client if the whiteboard was joined.
				clientSocket.emit('message', { 'status': 100, 'message': 'whiteboardData.name'});
			}
		},

		chatMessage : function(socket, clientSocket, msg){

				// No DB Stuff yet...
				//    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
				//      if (err) throw err;
				//    });

				console.log('Received chat message id=' + clientSocket.id + ', msg=' + msg);

				// Because this goes out the main socket, all clients will get it...
				mainListeningSocket.emit('chat message', msg);

				// this may be another way to send to all connected sockets:
				// mainListeningSocket.sockets.emit('messagename', 'message');
		},

		//Need to rework this so that it may catch when people close a session in terminal via iocat
		leave : function(streams, clientList, clientSocket){
			console.log('Client left: ' + clientSocket.id);
				streams.removeStream(clientSocket.id);

				var index = clientList.indexOf(clientSocket);
				if(index >= 0){
					clientList.splice(index, 1);
				}
		},
	}
}