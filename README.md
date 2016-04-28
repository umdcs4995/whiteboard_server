#Setup

Run envconf.sh:

    ./envconf.sh

Install the dependencies and start the server:

    npm install
    npm start

The server can be stopped with the command

    npm stop

Install Mongodb if you wish to use the mongo services with nodejs

#Structure

##index.js

index.js contains all of the initialization logic - initializing the logger, HTTP server, SocketIO servers, etc. Actual SocketIO code does not go here.

##app/client_handler.js

Contains all the code for handling SocketIO messages.

##app/rtc_handler.js

Contains all the code for handling SocketIO messages for the RTC signalling.

##app/whiteboards.js and app/clients.js

Modules for managing client and whiteboard interaction. If you want to use them in a module that doesn't already have access, something like

	var clients = require('./app/clients.js');
	
will give you the 'clients' object so you can do things like clients.add(client_socket) 

#Debugging

##Logs

Logs can be viewed in real time at http://localhost:3000/log.html (or on [lempo](https://lempo.d.umn.edu:4995/log.html))

##iocat

Using npm download: iocat

    npm install -g iocat

Iocat can be used to send messages to our nodejs server, which makes testing our methods easier.

You would start your nodejs server and then in another terminal type: iocat [options] URL
If you want to test a specific clause such as the on("joinWhiteBoard"...) method you would use the -e option (-e, --emit-key <key>     Emit-key, default is "message")

For example:

	iocat --socketio -e joinWhiteboard 127.0.0.1:3000

To send messages that can be parsed correctly you must send it in a JSON format, like so:
	
	{"name" : "UMD 4995's Whiteboard"}
