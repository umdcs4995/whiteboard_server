I basically followed this tutorial here for now, just as a proof of concept. 
http://socket.io/get-started/chat/

It's also running on heroku, but no guarantees that that's working 
https://immense-sands-16023.herokuapp.com/

#Setup

First setup mysql database:

    mysql -u[username] -p[password] < setup.sql

Then run envconf.sh or just use the defaults (below):

    cp defaults.env .env

Then install the dependencies and start the server:

    npm install
    npm start 

Go to http://localhost:3000/

Each tab in the browser will be a different user.

The server can be stopped with the command

    npm stop


#Actions in Index.js
All logic for the actions in index js such as 

	clientSocket.on(etc...)

will be contained in the file /app/actions.js

In order to add to this file just create your function in the return {} and do not forget to add a comma after the function. 

To invoke the methods just call actions.methodName

#Debugging

Using npm download: iocat

    npm install -g iocat

Iocat can be used to send messages to our nodejs server, which makes testing our methods easier.

You would start your node js server and then in another terminal type: iocat [options] URL
If you want to test a specific clause such as the on("joinWhiteBoard"...) method you would use the -e option (-e, --emit-key <key>     Emit-key, default is "message")

For example:

	iocat --socketio -e joinWhiteboard 127.0.0.1:3000

To send messages that can be parsed correctly you must send it in a JSON format
	
	{"key" : "value"}
