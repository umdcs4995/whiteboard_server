var clients = require('./clients.js');

/*
	Whiteboard Map :
		Key : Whiteboard Name
		Value:
			Another Map of all values
				Key Name : Name
				Key connections : number of connections
				Key clients : list of clients
 */
var whiteboardMap = {};

// adds a new whiteboard to the whiteboardmap
// returns true if successful, false if not
module.exports.add = function(name) {
    if(!whiteboardMap[name]) {
        whiteboardMap[name] = {};
        return true;
    }
    return false;
}

// removes a whiteboard from the whiteboardmap
// returns true if successful, false if not
module.exports.remove = function(name) {
    if(whiteboardMap[name]) {
        delete whiteboardMap[name];
        return true;
    }
    return false;
}

module.exports.exists = function(name) {
    return whiteboardMap[name] != null;
}

module.exports.list = function() {
    return Object.keys(whiteboardMap);
}

// adds the client to the whiteboard specified by name
// returns true if successful, false if not
module.exports.addClient = function(name, client_id) {
    if(whiteboardMap[name]) {
        if(whiteboardMap[name].clients)
            whiteboardMap[name].clients.push(client_id);
        else
            whiteboardMap[name].clients = [ client_id ];
        return true;
    }
    return false;
}

module.exports.removeClient = function(name, client_id) {
    if(whiteboardMap[name] && whiteboardMap[name].clients) {
        var pos = whiteboardMap[name].clients.indexOf(client_id)
        if(pos >= 0) {
            whiteboardMap[name].clients.splice(pos,1);
            if(whiteboardMap[name].clients.length == 0)
                delete whiteboardMap[name];
            return true;
        }
    }
    return false;
}

// gets clients IDs in a whiteboard named name
// returns empty list if it doesn't succeed
module.exports.getClients = function(name) {
    if(whiteboardMap[name])
        return whiteboardMap[name].clients
    else
        return []    
}