module.exports = function(io, whiteboards, clients, logger) {
    io.on('connection', function(clientSocket) {
        
        clients.add(clientSocket);
        clientSocket.emit('connection', clientSocket.id);
        logger.log("client connected: " + clientSocket.id)

        clientSocket.on('createWhiteboard', function(msg) {
            var data = JSON.parse(msg);
            logger.log('new whiteboard with name: ' + data.name);
		
            if(whiteboards.add(data.name) && clients.joinWhiteboard(clientSocket.id, data.name)) {
                clientSocket.emit('createWhiteboard', { 'status': 100, 'message': 'Successfully created whiteboard' });
            } else {
                clientSocket.emit('createWhiteboard', { 'status': 404, 'message': 'Could not create whiteboard' });
            }
        });

        clientSocket.on('joinWhiteboard', function(msg) {
            var data = JSON.parse(msg);
            logger.log('client ' + clientSocket.id + ' wants to join ' + data.name);
		
            if(clients.joinWhiteboard(clientSocket.id, data.name)) {
                clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': 'Successfully created whiteboard' });
            } else {
                clientSocket.emit('joinWhiteboard', { 'status': 404, 'message': 'Could not join whiteboard' });
            }
        });

        // chat message - echoes the message to all connected clients
        clientSocket.on('chat message', function(msg){
            logger.log('received message from ' + clientSocket.id + ": " + msg, true);
            io.emit(msg);
        });
    
        // draw event - echoes the message to all clients in the same whiteboard
        clientSocket.on('drawevent', function(msg){
            var data = JSON.parse(msg);
            var client = clients.get(clientSocket);
            logger.log('client ' + clientSocket.id + ' is sending a draw message to whiteboard ' + client.whiteboard + ': ' + msg, true);
        
            // TODO: this should probably work better
            whiteboards.getClients(client.whiteboard).forEach (function(id) {
                if(id != clientSocket.id)
                    clients.get(id).emit('drawevent', msg);
            });
        });

        // this is called when a client just quits
        clientSocket.on('disconnect', function(){
            logger.log(clientSocket.id + ' disconnected');
            clients.remove(clientSocket);
        });
    
        // this is called when a client requests to leave
        clientSocket.on('leave', function(){
            logger.log(clientSocket.id + ' is leaving');
            clients.remove(clientSocket);
        });
    });
};