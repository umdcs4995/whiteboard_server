var whiteboards = require('./whiteboards.js'),
    clients = require('./clients.js');

module.exports = function(io, logger) {
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
		
            if(clients.joinWhiteboard(clientSocket.id, data.name)) {
                logger.log('client ' + clientSocket.id + ' joined whiteboard ' + data.name);
                clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': 'Successfully joined whiteboard' });
            } else {
                clientSocket.emit('joinWhiteboard', { 'status': 404, 'message': 'Could not join whiteboard' });
            }
        });

        // chat message - echoes the message to all connected clients
        clientSocket.on('chat message', function(msg){
            logger.log('received message from ' + clientSocket.id);
            logger.dump(msg);
            io.emit(msg);
        });
    
        // draw event - echoes the message to all clients in the same whiteboard
        clientSocket.on('drawevent', function(msg){
            var client = clients.get(clientSocket);
            logger.log('client ' + clientSocket.id + ' is sending a draw message to whiteboard ' + client.whiteboard);
            logger.dump(msg);

            if(client.Whiteboard === undefined){
                console.log("Client is sending to undefind");
                clientScoket.emit("ConnectionError", msg);
            }else{
                // TODO: this should probably work better
                whiteboards.getClients(client.whiteboard).forEach (function(id) {
                    if(id != clientSocket.id)
                        clients.get(id).socket.emit('drawevent', msg);
                });
            }
        });
        
        clientSocket.on('logger', function() {
            logger.dump(clientSocket.id + ' identified itself as a logging client');
            logger.add_logger(clientSocket);
        });

        // this is called when a client just quits
        clientSocket.on('disconnect', function(){
            logger.log(clientSocket.id + ' disconnected');
            clients.remove(clientSocket);
            // just in case client is also a logging client
            logger.remove_logger(clientSocket);
        });
    
        // this is called when a client requests to leave
        clientSocket.on('leave', function(){
            logger.log(clientSocket.id + ' is leaving');
            clients.remove(clientSocket);
        });
    });
};