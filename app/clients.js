var whiteboards = require('./whiteboards.js');

/*
	Client Map:
		Key: clientSocket.id
		Velue: Another nested map
			Socket
			Whiteboard
 */
var clientMap = {};

// adds a new client to the clientmap
// returns true if successful, false if not
module.exports.add = function(client) {
    // you can add a client either by its socket or its id
    var id = client;
    // if you pass a socket object, its id is used as a key
    if(client.hasOwnProperty('id'))
        id = client.id;
    
    if(!clientMap[id]) {
        clientMap[id] = {};
        clientMap[id].email = "";
        clientMap[id].name = "";
        clientMap[id].picture = "";
        if(client.hasOwnProperty('id'))
            clientMap[id].socket = client;
        else
            clientMap[id].socket = "";
        return true;
    }
    return false;
}

module.exports.updateClient = function(client, data) {
    // you can add a client either by its socket or its id
    var id = client;
    // if you pass a socket object, its id is used as a key
    if(client.hasOwnProperty('id'))
        id = client.id;

    if(clientMap[id]) {
        if(data.email != null)
            clientMap[id].email = data.email;
        if(data.name != null)
            clientMap[id].name = data.name;
        if(data.picture != null)
            clientMap[id].picture = data.picture;
        return true;
    }
    return false;
}

module.exports.authenticate = function(client, email, username) {
    // you can add a client either by its socket or its id
    var id = client;
    // if you pass a socket object, its id is used as a key
    if(client.hasOwnProperty('id'))
        id = client.id;
    
    if(clientMap[id]) {
        emailFound = false;
        Object.keys(clientMap).forEach(function(key) {
            if(key!== id && clientMap[key].email === email) {
                emailFound = true;
            }
        });
        
        if(emailFound)
            return false;
        
        clientMap[id].email = email;
        clientMap[id].username = username;
        return true;
    }
    return false;
}

// removes a client from the clientmap
// returns true if successful, false if not
module.exports.remove = function(client) {
    // you can add a client either by its socket or its id
    var id = client;
    // if you pass a socket object, its id is used as a key
    if(client.hasOwnProperty('id'))
        id = client.id;
    
    if(clientMap[id]) {
        
        // if the client is in a whiteboard, remove them from it
        if(clientMap[id].whiteboard) {
            whiteboards.removeClient(clientMap[id].whiteboard, id);
        }
        
        delete clientMap[id];
        return true;
    }
    
    return false;
}

module.exports.get = function(client) {
    if(client.hasOwnProperty('id'))
        return clientMap[client.id];
    return clientMap[client];
}

module.exports.getInfo = function(client) {
    id = client;
    if(client.hasOwnProperty('id'))
        id = clientMap[client.id];
    
    if(!clientMap[id])
        return {};
    
    info = {};
    if(clientMap[id].hasOwnProperty('email'))
        info.email = clientMap[id].email;
    if(clientMap[id].hasOwnProperty('email'))
        info.name = clientMap[id].name;
    if(clientMap[id].hasOwnProperty('email'))
        info.picture = clientMap[id].picture;
    if(clientMap[id].hasOwnProperty('email'))
        info.whiteboard = clientMap[id].whiteboard;
    
    return info;
}

module.exports.list = function() {
    return Object.keys(clientMap);
}

module.exports.joinWhiteboard = function(client_id, wb_name) {
    if(clientMap[client_id] && whiteboards.exists(wb_name)) {
        // the client is already in a whiteboard, so remove him from it.
        if(clientMap[client_id].whiteboard)
            whiteboards.removeClient(clientMap[client_id].whiteboard, client_id);
        clientMap[client_id].whiteboard = wb_name;
        whiteboards.addClient(wb_name, client_id);
        return true;
    }
    return false;
}
