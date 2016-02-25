var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mysql  = require('mysql');
//TODO: set up env file for db info
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'pass',
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

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//connection.end();
