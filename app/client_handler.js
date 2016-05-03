var whiteboards = require('./whiteboards.js'),
    clients = require('./clients.js');

module.exports = function(io, logger, mongodb) {
    io.on('connection', function(clientSocket) {

        // on connection add user to the database for future user account expansion
        if(clients.add(clientSocket)){
            mongodb.insertUser(clientSocket.id);
        }

        clientSocket.emit('connection', clientSocket.id);
        logger.log("client connected: " + clientSocket.id)

        /**
         * clientInformation handler - Will update the client information
         * in clients with fields in msg
         *
         * msg - JSON object containing fields "name", "picture", "email"
         */
        clientSocket.on('clientInformation', function(msg){
            var data = JSON.parse(msg);
            if(clients.updateClient(clientSocket.id, data)) {
                logger.log("Updated user information.");
            } else {
                logger.log("Not updated user information.");
            }
        });

        /**
         * createWhiteboard handler - Creates a Whiteboard (saving it in temporary whiteboards
         * array and database). Creator joins that Whiteboard on creation.
         *
         * msg - JSON object that contains Whiteboard fields
         */
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

        /**
         * joinWhiteboard handler - Joins a user to a Whiteboard.
         *
         * msg - JSON object containing Whiteboard fields
         */
        clientSocket.on('joinWhiteboard', function(msg) {
            var data = JSON.parse(msg);
		
            if(clients.joinWhiteboard(clientSocket.id, data.name)) {
                logger.log('client ' + clientSocket.id + ' joined whiteboard ' + data.name);
                mongodb.dumpDrawEvents(data.name, function(err,result) {
                    if(result!="no"){
                        result.forEach(function(doc){
                            clientSocket.emit('drawevent', doc);
                        });
                    }
                });
                clientSocket.emit('joinWhiteboard', { 'status': 100, 'message': 'Successfully joined whiteboard' });
            } else {
                clientSocket.emit('joinWhiteboard', { 'status': 404, 'message': 'Could not join whiteboard' });
            }
        });

        /**
         * deleteWhiteboard handler - Deletes Whiteboard and all kicks all users out.
         *
         * msg - JSON object containing Whiteboard fields
         */
        clientSocket.on('deleteWhiteboard', function(msg) {
            var data = JSON.parse(msg);
		
            whiteboards.getClients(data.name).forEach (function(id) {
                if(id != clientSocket.id)
                    clients.get(id).socket.emit('deleteWhiteboard', { 'status': 200, 'message': 'Closing time! You don\'t have to go home but you can\'t stay here!'})
            });
        
            if(whiteboards.remove(data.name)) {
                logger.log('client ' + clientSocket.id + ' deleted whiteboard ' + data.name);
                mongodb.deleteWhiteboard(data.name,function(results){
                    if(results)
                        console.log('Successful removed whiteboard' + data.name + ' from database');
                    else
                        console.log('Unsucessful at removing whiteboard ' + data.name + 'from database');
                });
                clientSocket.emit('deleteWhiteboard', { 'status': 100, 'message': 'Successfully deleted whiteboard' });
            } else {
                clientSocket.emit('deleteWhiteboard', { 'status': 404, 'message': 'Could not delete whiteboard' });
            }
        });
        
        // 'me' - responds with the client object that we have for the current connection
        clientSocket.on('me', function(msg){
            logger.log(clientSocket.id + ' requested info on themselves');
            var client = clients.getInfo(clientSocket);
            clientSocket.emit('me', client);
        });

        // chat message - echoes the message to all connected clients
        clientSocket.on('chat message', function(msg){
            logger.log('received message from ' + clientSocket.id);
            logger.dump(msg);
            io.emit(msg);
        });

        /**
         * drawEvent handler - emits the draw event messsage to Whiteboard clients, logs the message and inserts the drawevents
         * into the database.
         */
        clientSocket.on('drawevent', function(msg){
            var client = clients.get(clientSocket);
            logger.dump(msg);
            mongodb.insertDrawEvent(client.whiteboard,msg);

            if(client.whiteboard === undefined){
                logger.log('client ' + clientSocket.id + ' is sending a drawmessage when they aren\'t in a whiteboard');
                clientSocket.emit("ConnectionError", msg);
            } else{
                // TODO: this should probably work better
                logger.log('client ' + clientSocket.id + ' is sending a draw message to whiteboard ' + client.whiteboard);
                whiteboards.getClients(client.whiteboard).forEach (function(id) {
                    if(id != clientSocket.id)
                        clients.get(id).socket.emit('drawevent', msg);
                });
            }
        });

        /**
         * drawEventDump handler - takes all drawEvents from a whiteboard stored in the database and emits them back to
         * the client.
         *
         * msg - Whiteboard JSON object.
         */
        clientSocket.on('drawEventDump', function(msg){
            var client = clients.get(clientSocket);
            if(client.whiteboard == null) {
                clientSocket.emit("ConnectionError,", msg);
            }
            else {
                logger.log('client ' + clientSocket.id + ' is requesting drawing events from whiteboard ' + client.whiteboard);
                mongodb.dumpDrawEvents(client.Whiteboard, function (err, result) {
                    if (result != "no") {
                        result.forEach(function (doc) {
                            clientSocket.emit('drawevent', doc);
                        });
                    }
                });
            }
        });
        
        clientSocket.on('clearWhiteboard', function(msg){
            var data = JSON.parse(msg);

            if(client.whiteBoard == null){
                clientSocket.emit("ConnectionError", msg);
            }
            else{
                mongodb.clearWhiteboardDrawEvemts(data.name);
                whiteboards.getClients(client.whiteboard).forEach (function(id) {
                    clients.get(id).socket.emit('clearWhiteboard', msg);
                });
            }
        });
        
        clientSocket.on('logger', function() {
            logger.dump(clientSocket.id + ' identified itself as a logging client');
            logger.add_logger(clientSocket);
        });
        
        clientSocket.on('authenticate', function(msg) {
            var data = JSON.parse(msg);
        
            if(clients.authenticate(clientSocket.id, data.email, data.username)) {
                logger.log('client '+clientSocket.id+' authenticated with email ' + data.email);
                clientSocket.emit('authenticate', { 'status': 100, 'message': 'Successfully authenticated' });
            } else {
                clientSocket.emit('authenticate', { 'status': 404, 'message': 'Could not authenticate' });
            } 
        });
        
        clientSocket.on('listClients', function() {
            if(clients.get(clientSocket.id).whiteboard) {
                var whiteboard = clients.get(clientSocket.id).whiteboard;
                logger.log('client '+clientSocket.id+' requested user info for ' + whiteboard);
                
                var clientInfo = [];
                whiteboards.getClients(whiteboard).forEach(function(key) {
                    info = {};
                    info = clients.getInfo(key);
                    clientInfo.push(info);
                });
                
                clientSocket.emit('listClients', { 'status': 100, 'clients': clientInfo });
            } else {
                clientSocket.emit('listClients', { 'status': 404, 'message': 'You are not in a whiteboard' });
            } 
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
