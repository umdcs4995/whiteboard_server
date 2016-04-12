var whiteboards = require('./whiteboards.js'),
    clients = require('./clients.js');

module.exports = function(io, logger, mongodb) {
    io.on('connection', function(clientSocket) {
        
        if(clients.add(clientSocket)){
            mongodb.insertUser(clientSocket.id);
        }

        clientSocket.emit('connection', clientSocket.id);
        logger.log("client connected: " + clientSocket.id)

        clientSocket.on('createWhiteboard', function(msg) {
            var data = JSON.parse(msg);
            logger.log('new whiteboard with name: ' + data.name);
		
            if(whiteboards.add(data.name) && clients.joinWhiteboard(clientSocket.id, data.name)) {
                mongodb.insertWhiteboard(data);
                clientSocket.emit('createWhiteboard', { 'status': 100, 'message': 'Successfully created whiteboard' });
            } else {
                clientSocket.emit('createWhiteboard', { 'status': 404, 'message': 'Could not create whiteboard' });
            }
        });

        clientSocket.on('joinWhiteboard', function(msg) {
            var data = JSON.parse(msg);
		
            if(clients.joinWhiteboard(clientSocket.id, data.name)) {
                logger.log('client ' + clientSocket.id + ' joined whiteboard ' + data.name);
                mongodb.insertUserInWhiteboard(data.name,clientSocket.id);
                mongodb.dumpDrawEvents(data.name, function(results){
                    results.drawEvents.forEach(function(doc){
                        clientSocket.emit('drawevent',doc.event);
                    });
                });
                clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': 'Successfully joined whiteboard' });
            } else {
                clientSocket.emit('joinWhiteboard', { 'status': 404, 'message': 'Could not join whiteboard' });
            }
        });
        
        clientSocket.on('deleteWhiteboard', function(msg) {
            var data = JSON.parse(msg);
		
            whiteboards.getClients(data.name).forEach (function(id) {
                if(id != clientSocket.id)
                    clients.get(id).socket.emit('deleteWhiteboard', { 'status': 200, 'message': 'Closing time! You don\'t have to go home but you can\'t stay here!'})
            });
        
            if(whiteboards.remove(data.name)) {
                logger.log('client ' + clientSocket.id + ' deleted whiteboard ' + data.name);
                clientSocket.emit('deleteWhiteboard', { 'status': 100, 'message': 'Successfully deleted whiteboard' });
            } else {
                clientSocket.emit('deleteWhiteboard', { 'status': 404, 'message': 'Could not delete whiteboard' });
            }
        });
        
        // 'me' - responds with the client object that we have for the current connection
        clientSocket.on('me', function(msg){
            logger.log(clientSocket.id + ' is having an identity crisis');
            var client = clients.get(clientSocket);
            clientSocket.emit('me', {'whiteboard': client.whiteboard, 'socket': client.socket.id});
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
            logger.dump(msg);
            mongodb.insertDrawEvent(client.whiteboard,msg);

            if(client.whiteboard === undefined){
                logger.log('client ' + clientSocket.id + ' is sending a drawmessage when they aren\'t in a whiteboard');
                clientSocket.emit("ConnectionError", msg);
            }else{
                // TODO: this should probably work better
                logger.log('client ' + clientSocket.id + ' is sending a draw message to whiteboard ' + client.whiteboard);
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