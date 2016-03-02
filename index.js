var app = require('express')();
var http = require('http').Server(app);
var mainListeningSocket = require('socket.io')(http);
require('dotenv').config();

var mysql  = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : 'hcc'
});
connection.connect();
    
// add all the handlers to an array....


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

mainListeningSocket.on('connection', function(clientSocket){
  console.log('user connected');

  clientSocket.on('chat message', function(msg){
    
//    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
//      if (err) throw err;
//    });

//     console.log('Received message from IP' + socket.remoteAddress() + ', id=' + socket.id + ', msg=' + msg);
    console.log('Received message from IP, id=' + clientSocket.id + ', msg=' + msg);
    
    mainListeningSocket.emit('chat message', msg);

  });
  
  clientSocket.on('motionevent', function(msg) {

// DB queries not yet reliable
//    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
//      if (err) throw err;
//    });

    mainListeningSocket.emit('motionevent', msg);
    console.log('motionevent', msg);
    });
 
});

var port = process.env.PORT || 3000

http.listen(port, function(){
  console.log('listening on *:' + port);
});

//connection.end();
