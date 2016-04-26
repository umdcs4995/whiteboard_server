var mongojs = require("mongojs"); //mongo wrapper
var url = 'mongodb://localhost:27017/test'; //URL: this is for test purposes
var collections = ['users','whiteboards']; //Array of known collections

var assert = require('assert');

module.exports = function() {
    mongodb = mongojs(url, collections);
    console.log("monogo database connected.");

    //Inserts a user json object into the 'users' collection.
    //If 'users' collection doesn't exist, one will be created.
    mongodb.insertUser = function(userObj) {
        mongodb.collection('users').save({"name":userObj}, function (err, result) {
            if(err || !result) console.log ("User not saved.");
            else console.log("Inserted a document into the Users collection.");
        });
    };

    //Inserts a whiteboard json object into the 'whiteboards' collection.
    //If 'whiteboards' collection doesn't exist, one will be created.
    mongodb.insertWhiteboard = function(whiteboardObj) {
        var data = whiteboardObj
        mongodb.collection('whiteboards').save(whiteboardObj, function (err, result) {
            if (err || !result) console.log("Whiteboard not saved.\n");
            else console.log("Inserted a document into the Whiteboard collection.\n");
        });
    }

    //Inserts a client json into the clients set of a whiteboard document
    mongodb.insertUserInWhiteboard = function(whiteboardName, userObj){
        console.log(userObj);
        var data = {$push: {client: userObj}};
        mongodb.collection('whiteboards').update({name: whiteboardName},data,function(err, result){
             if(err || !result) console.log("User not added to Whiteboard Document");
             else console.log("User added to Whiteboard Document");
         });
    };

    //Inserts a draw event into a whiteboard document in the draw events field
    mongodb.insertDrawEvent = function(whiteboardName, msg){
        var data = {$push: { drawEvents : msg}};
        mongodb.collection('whiteboards').update({name : whiteboardName},data);
    }

    //Provides a json object containing all the drawing events that have happened
    mongodb.dumpDrawEvents = function(whiteboardName, callback){
        mongodb.collection('whiteboards').find({ name: whiteboardName, drawEvents:{$exists: true}}, function(err, docs){
            if(err || !docs || docs == null || docs[0] == null) {
                console.log("Whiteboard drawevents not found.");
                callback(err,"no");
            }
            else {
                var data = docs[0].drawEvents;
                callback(err, data);
            }
        });
    };

    //Print collection
    mongodb.printDatabase = function(collectionInc) {
        var cursor = mongodb.collection(collectionInc).find(function(err, docs){
            if(err || !docs) console.log("Cannot print database or database is empty\n");
            else console.log(collectionInc, docs);
        });
    };

    //Find whiteboard by given parameters
    // !! not tested yet !!
    mongodb.findWhiteboard = function(parameter,callback){
        mongodb.collection('whiteboards').find(parameter,function(err, docs){
            if(err || !docs) console.log("Cannot find document\n");
            else callback(docs);
        });
    };

    //Finds user by given parameters
    mongodb.findUser = function(collectionInc,name, callback) {
        var cursor = mongodb.collection(collectionInc).find(parameter,function(err, docs){
            if(err || !docs) console.log ("User not found.\n")
            else callback(doc);
        });
    };

    mongodb.deleteWhiteboard = function(whiteboardName,callback) {
        mongodb.collection('whiteboards').remove(whiteboardName, 1);
        mongodb.collection('whiteboards').find(whiteboardName,function(docs){
            if(docs == null)
                callback(false);
            else
                callback(true);
        });
    }

    mongodb.clearWhiteboardDrawEvemts = function(whiteboardName){
        mongodb.collection('whiteboards').update({name:whiteboardName},{$unset:{drawEvents : ""}});
    }

    return mongodb;
}