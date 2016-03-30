/**
 * The format of this document should be kept as such:
 * 			Methods used in order of use in index.js
 * 			Helper functions
 * 			Debugger at end of file
 *
 * For functions the parameters should follow some sort of structure like this:
 * 			function(randomStuff, whiteboardMap, clientList, clientSocket, msg (or whatever variable name is caught on the action))
 */
async = require("async");
module.exports = function(){
    return {
        addClient : function(clientMap, clientSocket){
            // Client has connected.
            console.log('client connected: client id=' + clientSocket.id);

            // Add the client socket identifier to the client array
            clientMap[clientSocket.id] = {};
            clientMap[clientSocket.id].socket = clientSocket;

            // Emit the id back to the client so they know what their id is
            // (currently only used by RTC code)
            clientSocket.emit('connection', clientSocket.id);
        },

        /**
         * Creates a whiteboard whose name is passed in via the message
         * @param  {hashmap} whiteboardMap contains all whiteboard data for the Whiteboard Application
         * @param  {hashmap} clientMap     contains all clients in the Whiteboard Application
         * @param  {scoketIO} clientSocket  socket that you connect with
         * @param  {JSON object} msg        message that you send from Java application
         * @return 
         */
        createWhiteboard : function(whiteboardMap, clientMap, clientSocket, msg){
            console.log('createWhiteboard', msg);
            var whiteboardData = JSON.parse(msg);
            console.log('new whiteboard with name:', whiteboardData.name);
            // 	Checks if the whiteboard name exists in the map
            // 	Creates it if it doesn't, and adds the user to it
            // 	Otherwise it emits an error
            if(whiteboardMap[whiteboardData.name] == null){
                whiteboardMap[whiteboardData.name] = {};
                whiteboardMap[whiteboardData.name].name = whiteboardData.name;
                
                // Add client to the whiteboard's roster
                whiteboardMap[whiteboardData.name].clients = [clientSocket.id];
                // Remove the client from their currently active whiteboard, if they have one
                var clientPosition = whiteboardMap[clientMap[clientSocket.id].whiteboard].clients.indexOf(clientSocket.id)
                if(clientPosition != -1) {
                    whiteboardMap[clientMap[clientSocket.id].whiteboard].clients.splice(clientPosition,1);
                }
                // Also set the client's active whiteboard
                clientMap[clientSocket.id].whiteboard = whiteboardData.name;
                
                //Emit message if successful
                clientSocket.emit('createWhiteboard', { 'status': 100, 'message': 'Successful creation' });
            }
            else{
                clientSocket.emit('createWhiteboard', { 'status': 404, 'message': 'Name exists' });
            }
        },

        /**
         * Join Whiteboard connects you to an already existing whiteboard
         * @param  {hashmap} whiteboardMap contains all whiteboard data for the Whiteboard Application
         * @param  {hashmap} clientMap     contains all clients in the Whiteboard Application
         * @param  {scoketIO} clientSocket  socket that you connect with
         * @param  {JSON object} msg        message that you send from Java application
         */
        joinWhiteboard : function(whiteboardMap, clientMap, clientSocket, msg){
            console.log('joinWhiteboard', msg);
            //Parse message 
            var whiteboardData = JSON.parse(msg);
            console.log(clientSocket.id + " wants to join whiteboard " + whiteboardData.name);

            // Determine if this whiteboard exists
            try {
                if(whiteboardMap[whiteboardData.name]!=null){
                    // whiteBoardMap[whiteBoardData.name].clients.indexOf(clientSocket.id) != null)
                    // TODO: figure out the best way to handle the event 
                    // of a user already in a whitebaord.

                    // Add client to a Whiteboard's Roster
                    whiteboardMap[whiteboardData.name].clients.push(clientSocket.id);
                    // Remove the client from their currently active whiteboard, if they have one
                    var clientPosition = whiteboardMap[clientMap[clientSocket.id].whiteboard].clients.indexOf(clientSocket.id)
                    if(clientPosition != -1) {
                        whiteboardMap[clientMap[clientSocket.id].whiteboard].clients.splice(clientPosition,1);
                    }   
                    // Set client's active whiteboard to this one
                    clientMap[clientSocket.id].whiteboard = whiteboardData.name;
                    
                    //emit to client a confirmation of status:100
                    clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': whiteboardData.name});
                } else{
                    //Alert client that White board (name) does not exist
                    clientSocket.emit('joinWhiteboard', { 'status': 404, 'message': whiteboardData.name + ' does not exist'});
                }
            } catch(err){
                clientSocket.emit('joinWhiteboard', { 'status': 500, 'message': 'Error in joinWhiteboard. Did not join you to whiteboard.'});
            }
        },

        chatMessage : function(socket, clientSocket, msg){
            
            // No DB Stuff yet...
            console.log('Received chat message id=' + clientSocket.id + ', msg=' + msg);

            // Because this goes out the main socket, all clients will get it...
            socket.emit('chat message', msg);
        },
        
        /**
         * DrawEvent will take in all draw events from the client and emit them back to all clients connected to the same whiteboard
         * @param  {Master Socket} socket   master socket for emition back to everyone connected to the whiteboard application regardless of whiteboard name
         * @param  {hashmap} whiteboardMap contains all whiteboard data for the Whiteboard Application
         * @param  {hashmap} clientMap     contains all clients in the Whiteboard Application
         * @param  {scoketIO} clientSocket  socket that you connect with
         * @param  {JSON object} msg        message that you send from Java application
         */
        drawEvent : function(socket, clientSocket, clientMap, whiteboardMap, msg){
            
            // No logging because this would make the log insanely cluttered
            wb = clientMap[clientSocket.id].whiteboard;
            // console.log(clientMap)s
            // console.log(whiteboardMap)
            if(wb) {
                //Always use for each when dealing with these nested arrays/maps
                //Iterates through each client conected to the whiteboard that you are connected too
                whiteboardMap[wb].clients.forEach (function(id) {
                    console.log("client object " + id)
                    clientMap[id].socket.emit("drawevent", msg);
                });
            }
        },

        /**
         * MotionEvent is a function that simplies takes in motionEvents and emits them to
         * all clients connected to server. Deprecated. Use drawEvent.
         *
         * @param  {Master Socket} socket   master socket for emition back to everyone connected to the whiteboard application regardless of whiteboard name
         * @param  {JSON object} msg        message that you send from Java application
         */
        motionEvent : function(socket, msg){
            socket.emit('motionevent', msg);
            console.log('motionevent', msg);
        },

        /**
         * Message is the key for direct messaging. Not available at the moment. 
         *
         * @param  {socketIO} otherClient     Socket of reciever
         * @param  {scoketIO} clientSocket    Socket of sneder.
         * @param  {JSON object} details      Object containg data to send.
         */
        message : function(otherClient,clientSocket, details){
            if (!otherClient) {
                return;
            }
            delete details.to;
            details.from = clientSocket.id;
            otherClient.emit('message', details);
        },

        /**
         * Leave is important so that client sessions do not persist on exiting the applicaiton
         * @param  {Map} clientMap    map of clients
         * @param  {Socket IO} clientSocket your socket instance
         */
        leave : function(clientMap, clientSocket){
            console.log('Client left: ' + clientSocket.id);
            // checks if id is in the client map. If so it removes you from the client map.
            if(clientMap[clientSocket.id]){
                delete clientMap[clientSocket.id];
            }
        },

        //Debug method DO NOT TOUCH
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
	    	}	,
	  }
}
