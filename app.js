"use strict";
// Please notice that we are not affiliated, associated, authorized, endorsed by or in any way officially connected to Trello, Inc. (www.trello.com).

// Requirements of Modules
//  Trello module
var Trello = require("node-trello");
var async = require("async");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/webhooksForTrello");

// Loading config
var config = require("./config/config");

// Webhooks Schema for webhooks
var WebHooksSchema = new mongoose.Schema({
  idModel: String,
  description: String,
  callbackURL: String,
  updated_at: { type: Date, default: Date.now },
  active: Boolean
});

// Setting the Schema as a Model in Mongoose
var WebHook = mongoose.model("WebHook", WebHooksSchema);

//  Making the "t" object (this object access the api at trello) (based on Trello module) - with token key and secret key from Trello
var t = new Trello(config.trelloApplicationKey, config.trelloUserToken);

// This is for understanding aliens when they try to communicate with you.
app.use(bodyParser.urlencoded({ extended: false }));

// Same goes for the JSON aliens
app.use(bodyParser.json());

// Using our static client front-end system (look at index.html and scripts.js for more info about this)
app.use(express.static("./client"));

// Requiring the controller of webhooks and including the app, async, WebHook model and t (trello object)
require("./controller/webhooks")(app, async, WebHook, t);

// Get request of getting all boards owned by user at trello.
app.get("/getBoards", function (req, res) {
  // Creating a Board class.
  var Board = function(id, name){
    this.id = id;
    this.name = name;
  };

  // Array of Boards
  var boardArray = [];

  // init counter and boardSize
  var counter = 0;
  var boardSize = 0;

  // Get all board ids out
  t.get("/1/members/me", function (err, data) {
    if (err) {
       throw err;
    }

    // Setting the boardSize to the length of all boards
    boardSize = data.idBoards.length;

    // forEach on each board of all boards accessable by user
    data.idBoards.forEach(function (aBoard){

      // Setting the boardPath to /1/boards/aBoard (aBoard is a id of one of all boards)
      // The purpose of this function is to get all names of all boards and put it into a array, and send this array back
      // to the client end
      var boardPath = "/1/boards/" + aBoard;
        t.get(boardPath, function(err, theBoard) {
          counter++;
              if (err) throw err;
              var currentBoard = new Board(theBoard.id, theBoard.name);
              boardArray.push(currentBoard);
              if(counter === boardSize){
                res.send(boardArray);
              }
        });
      }
    );
  });
});

var server = app.listen(config.serverport, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Server is running at http://%s:%s", host, port);
});
