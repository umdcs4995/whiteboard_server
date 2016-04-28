/**
 * mongo.js - Module for server/mongo database interactions.
 */

var mongojs = require("mongojs"); //mongo wrapper
var url = 'mongodb://localhost:27017/test'; //URL: this is for test purposes
var collections = ['users','whiteboards']; //Array of known collections

var assert = require('assert');

module.exports = function() {
    mongodb = mongojs(url, collections); //creation of the mongo connection
    console.log("monogo database connected.");

    /**
     * insertUser - funcion that insert a user JSON object into the 'users' collection.
     * If 'users' collection doesn't exist, one will be created.
     * @param userObj
     */
    mongodb.insertUser = function(userObj) {
        mongodb.collection('users').save({"name":userObj}, function (err, result) {
            if(err || !result) console.log ("User not saved.");
            else console.log("Inserted a document into the Users collection.");
        });
    };

    /**
     * insertWhiteboard - Inserts a whiteboard json object into the 'whiteboards' collection.
     * If 'whiteboards' collection doesn't exist, one will be created.
     * @param whiteboardObj
     */
    mongodb.insertWhiteboard = function(whiteboardObj) {
        var data = whiteboardObj
        mongodb.collection('whiteboards').save(whiteboardObj, function (err, result) {
            if (err || !result) console.log("Whiteboard not saved.\n");
            else console.log("Inserted a document into the Whiteboard collection.\n");
        });
    }

    /**
     * insertUserInWhiteboard - inserts a client JSON into the clients array of whiteboard
     * document.
     * @param whiteboardName - whiteboard name to add client
     * @param userObj - client JSON object
     */
    mongodb.insertUserInWhiteboard = function(whiteboardName, userObj){
        console.log(userObj);
        var data = {$push: {client: userObj}};
        mongodb.collection('whiteboards').update({name: whiteboardName},data,function(err, result){
             if(err || !result) console.log("User not added to Whiteboard Document");
             else console.log("User added to Whiteboard Document");
         });
    };

    /**
     * insertDrawEvent - Inserts a draw event into a Whiteboard docuemnt. If drawEvents field
     * doesn't exist, the field will be created.
     * @param whiteboardName - whiteboard name to add draw events
     * @param msg - the draw event message
     */
    mongodb.insertDrawEvent = function(whiteboardName, msg){
        var data = {$push: { drawEvents : msg}};
        mongodb.collection('whiteboards').update({name : whiteboardName},data);
    }

    /**
     * dumpDrawEvents - Returns all drawEvents stored in the database from a single whiteboard.
     * @param whiteboardName - whiteboard name
     * @param callback - callback to called function
     */
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

    /**
     * printDatabase - Prints the whole collection, for debugging pursposes.
     * @param collectionInc - the name of the collection
     */
    mongodb.printDatabase = function(collectionName) {
        var cursor = mongodb.collection(collectionName).find(function(err, docs){
            if(err || !docs) console.log("Cannot print database or database is empty\n");
            else console.log(collectionName, docs);
        });
    };

    /**
     * findWhiteboard - Finds the whiteboard in the database and returns
     * @param parameter
     * @param callback
     */
    mongodb.findWhiteboard = function(parameter,callback){
        mongodb.collection('whiteboards').find(parameter,function(err, docs){
            if(err || !docs) console.log("Cannot find document\n");
            else callback(docs);
        });
    };

    /**
     * findUser - Finds specific users in specific whiteboard.
     * @param name
     * @param callback
     */
    mongodb.findUser = function(name, callback) {
        var cursor = mongodb.collection('whiteboards').find(parameter,function(err, docs){
            if(err || !docs) console.log ("User not found.\n")
            else callback(doc);
        });
    };

    /**
     * deleteWhiteboard - Deletes whiteboard from database
     * @param whiteboardName
     * @param callback - callback to original function call, will return boolean based success/failure.
     */
    mongodb.deleteWhiteboard = function(whiteboardName,callback) {
        mongodb.collection('whiteboards').remove(whiteboardName, 1);
        mongodb.collection('whiteboards').find(whiteboardName,function(docs){
            if(docs == null)
                callback(false);
            else
                callback(true);
        });
    }

    /**
     * clearWhiteboardDrawEvents - Will clear all stored draw events from a specific whiteboard
     * in the database.
     * @param whiteboardName
     */
    mongodb.clearWhiteboardDrawEvemts = function(whiteboardName){
        mongodb.collection('whiteboards').update({name:whiteboardName},{$unset:{drawEvents : ""}});
    }

    return mongodb;
}