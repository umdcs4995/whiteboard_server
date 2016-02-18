I basically followed this tutorial here for now, just as a proof of concept. 
http://socket.io/get-started/chat/

It's also running on heroku, but no guarantees that that's working 
https://immense-sands-16023.herokuapp.com/

to run: 
node server from the project's root and go to localhost:5000

each tab in the browser will be a different user


#Troubleshooting

If you guys run into the same problem I did where you get an error such as:
```
  module.js 344:
    throw err;
    ^
    
  Error: Cannot find module 'socket.io'
    at Function.Module._resolveFilename (module.js:339:15)
    at Function.Module._load (module.js:290:25)
    at Module.require (module.js:367:17)
    at require (internal/module.js:16:19)
    at Object.<anonymous> (/Users/Drax/Programming/nodejs/index.js:3:10)
    at Module._compile (module.js:413:34)
    at Object.Module._extensions..js (module.js:422:10)
    at Module.load (module.js:357:32)
    at Function.Module._load (module.js:314:12)
```
    
and you are very sure that the node modules are installed then give this a try.

* go to the app directory
* rm -rf node_modules
* npm cache clean
* npm install
* npm install \<other packages\>

Then try running again. This worked for me and hopefully will work for you
