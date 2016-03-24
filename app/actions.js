/**
 * The format of this document should be kept as such:
 * 			Methods used in order of use in index.js
 * 			Helper functions
 * 			Debugger at end of file
 *
 * For functions the parameters should follow some sort of structure like this:
 * 			function(randomStuff, whiteboardMap, clientList, clientSocket, msg (or whatever variable name is caught on the action))
 */

module.exports = function(){
	return {
		addClient : function(clientMap, clientSocket){
			// Client has connected.
			console.log('client connected: client id=' + clientSocket.id);

			// Add the client socket identifier to the client array
			clientMap[clientSocket.id] = clientSocket;

			// Emit the id back to the client so they know what their id is
			// (currently only used by RTC code)
			clientSocket.emit('connection', clientSocket.id);
		},

		// createWhiteboard
		// creates a whiteboard with info from JSON data
		createWhiteboard : function(whiteboardMap, clientSocket, msg){
				console.log('createWhiteboard', msg);
				var whiteboardData = JSON.parse(msg);
				console.log('new whiteboard with name:', whiteboardData.name);
				if(whiteboardMap[whiteboardData.name] == null){
					whiteboardMap[whiteboardData.name] = {};
					whiteboardMap[whiteboardData.name].name = whiteboardData.name;
					whiteboardMap[whiteboardData.name].clients = [clientSocket];
					clientSocket.emit('createWhiteboard', { 'status': 100, 'message': 'Successful creation' });
				}
				else{
					clientSocket.emit('createWhiteboard', { 'status': 404, 'message': 'Name exists' });
				}
		},

		// joinWhiteboard - Client Protocol Message
		// joins whiteboards by id
		joinWhiteboard : function(whiteboardMap, clientSocket, msg){
			console.log('joinWhiteboard', msg);

			var whiteboardData = JSON.parse(msg);
			console.log(msg);
			console.log('   name: ', whiteboardData.name);
			console.log('   username: ', whiteboardData.username);

			// Determine if this whiteboard exists
			if(whiteboardMap[whiteboardData.name]!=null){
				clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': whiteboardData.name})
				
				// Query DB to see if user is already in whiteBoard's roster
					//if not, add user to roster w/ subsequent information 
			} else{
				//Alert client that White board (name) does not exist
				clientSocket.emit('message', { 'status': 100, 'message': whiteboardData.name + ' does not exist'});
			}
		},

		chatMessage : function(socket, clientSocket, msg){

				// No DB Stuff yet...

				console.log('Received chat message id=' + clientSocket.id + ', msg=' + msg);

				// Because this goes out the main socket, all clients will get it...
				mainListeningSocket.emit('chat message', msg);

				// this may be another way to send to all connected sockets:
				// mainListeningSocket.sockets.emit('messagename', 'message');
		},

		motionEvent : function(mainListeningSocket, msg){
			// DB queries not yet reliable

			mainListeningSocket.emit('motionevent', msg);
			console.log('motionevent', msg);
		},

		motionEventBinary : function(mainListeningSocket, msg){ //FUNCTION IS TEMPORARY, please don't touch
			// No DB Stuff yet...
			
			mainListeningSocket.emit('motionevent', msg);
			console.log('motionevent', msg);
		},

		message : function(otherClient,clientSocket, details){
			if (!otherClient) {
				return;
			}
			delete details.to;
			details.from = clientSocket.id;
			otherClient.emit('message', details);
		},

		//Need to rework this so that it may catch when people close a session in terminal via iocat
		leave : function(clientMap, clientSocket){
			console.log('Client left: ' + clientSocket.id);
				//var index = clientList.indexOf(clientSocket);
				if(clientMap[clientSocket.id]){
					delete clientMap[clientSocket.id];
				}
		},

		listAllClients : function (clientMap, clientSocket){
			var str = "";
			//clientList.forEach(function(c){
			for(key in clientMap){
				str += clientMap[key] + " , ";
			}
			clientSocket.emit('listAllClients', str);
		},

		listAllWhiteBoards: function (whiteboardMap, clientSocket){
			var str = "";
			for(key in whiteBoardMap){
				str += whiteboardMap[key].name + " , ";
			}
			clientSocket.emit('listAllWhiteBoards', str);
		},
	}
}