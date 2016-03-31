var socket = new Object;

module.exports = function(s) {
    socket = s;
    
    logger = {};
    logger.log = function(msg, ignore) {
        console.log(msg);
    }
    return logger;
}