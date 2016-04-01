// Change this if you want to get lots and lots of output
var verbose = false;

// If this is set, all messages will be broadcast to logging clients as well
var remote_debug = false;
var sockets = [];

module.exports = function(v, r) {
    verbose = v;
    remote_debug = r;
    
    logger = {};
    logger.log = function(msg) {
        console.log(msg);
        if(remote_debug) {
            sockets.forEach(function(s) {
                s.emit('logmessage', msg);
            });
        }
    }
    // send big chunks here - like drawevents
    logger.dump = function(msg) {
        if(verbose) {
            console.log(msg);
            sockets.forEach(function(s) {
                s.emit('logmessage', msg);
            });
        }
    }
    
    logger.add_logger = function(socket) {
        sockets.push(socket);
    }
    
    logger.remove_logger = function(socket) {
        var pos = sockets.indexOf(socket);
        if(pos >= 0)
            sockets.splice(pos, 1);
    }
    
    logger.log("logger started. verbose: " + verbose + ", remote_debug: " + remote_debug);
    
    return logger;
}