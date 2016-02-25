var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('dotenv').config();

var mysql  = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : 'hcc'
});
connection.connect();
    

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('user connected');
  socket.on('chat message', function(msg){
    
    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
      if (err) throw err;
    });
    
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
  
  socket.on('motionevent', function(msg) {

    connection.query('insert into message (user_id, chat_id, message) values(?, ?, ?) ', ["1", "1", msg], function(err, fields) {
      if (err) throw err;
    });

    io.emit('motionevent', msg);
    console.log('motionevent', msg);
    });
 
});

var port = process.env.PORT || 3000

http.listen(port, function(){
  console.log('listening on *:' + port);
});

//connection.end();
