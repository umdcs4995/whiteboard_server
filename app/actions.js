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
				console.log('   name: ', whiteboardData.name);

				// Some of our message parameters may be optional. 
				// For instance,
				// Verify if the whiteboard can be created 
				whiteboardMap[whiteboardData.name] = {whiteboardData.name : whiteboardData.name};
				whiteboardMap[whiteBoardData.name]["clients"] = [clientSocket];
				// Alert the client if the whiteboard was created.
				// 
				clientSocket.emit('createWhiteboard', { 'status': 100, 'message': 'Successful creation' });
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
			try {
				if(whiteboardMap[whiteboardData.name]!=null && ){
					//whiteBoardMap[whiteBoardData.name].clients.indexOf(clientSocket.id) !=null){
				   		//commented out to figure out the best way to handle the event of a user already in a whitebaord.

					// Add client to a WhiteBoard's Roster
					whiteBoardMap[whiteboardData.name].clients.push(clientSocket.id);
					
					//emit to client a confirmation of status:100
					clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': whiteboardData.name});
				} else{
					//Alert client that White board (name) does not exist
					clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': whiteboardData.name + ' does not exist'});
				}
			} catch(err){
				clientSocket.emit('joinWhiteBoard', { 'status': 100, 'message': 'Error in joinWhiteboard. Did not join you to whiteboard.'});
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