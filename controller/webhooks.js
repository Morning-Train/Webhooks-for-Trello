"use strict";

module.exports = function (app, async, WebHook, t) {

  var createNewWebhook = function(req, res){
    var continueThis;

      var letMeContinue = function(continueThis){
      if(continueThis){
        var myWebHook = new WebHook();

        if(typeof req.body.idModel !== undefined){
          myWebHook.idModel = req.body.idModel;
        } else {
          myWebHook.idModel = req.body.board;
        }

        myWebHook.callbackURL = req.body.callback_area;
        myWebHook.description = req.body.desc_area;

        var webHookState = "";

        async.series([
          function(callback){
            t.post("/1/webhooks/", { description: myWebHook.description, callbackURL: myWebHook.callbackURL, idModel: myWebHook.idModel }, function (req, res) {
                webHookState = res;
                callback(null, "a");
            });
          },
          function(callback){
              // console.log(webHookState);
              callback(null, "b");
          },
          function(callback){
              if(typeof webHookState === "object"){
                // console.log("is an object");
                // console.log(webHookState);
                if(webHookState.active === true){
                  myWebHook._id = webHookState.id;
                  myWebHook.active = webHookState.active;
                  myWebHook.save();
                  // console.log(myWebHook);
                  res.sendStatus(200);
                } else {
                  res.status(400).send("Status: Something went wrong....");
                  callback(null, "c");
                }
              } else if(typeof webHookState === "string"){
                res.status(400).send("Status: " + webHookState);
                callback(null, "c");
              }
          }
        ]);
      }
    };

    continueThis = checkWebhookBody(res, req, letMeContinue);
  };

  var checkWebhookBody = function(res, req, callback){
    if(req.body.webhooks_id !== undefined){
      removeOneWebhookById(req.body.webhooks_id);
    }

    if(req.body.idModel === "none" || req.body.idModel === undefined){
      res.status(418);
      res.send("Pick a board");
      return false;
    }

    else if(req.body.desc_area === undefined || req.body.desc_area === ""){
      res.status(418);
      res.send("Please write a description");
      return false;
    }

    else if(req.body.callback_area === undefined || req.body.callback_area === ""){
      res.status(418);
      res.send("Please write a callback URL");
      return false;
    } else {
      callback(true);
    }
  };

  var getAllWebhooks = function(res){
    var counter = 0;

    WebHook.find({}, function(err, webhooks){
    var webHookMap = {};
    async.series([
      function(callback){
        webhooks.forEach(function(webhook){
          t.get("/1/webhooks/" + webhook.id, function (req, res) {
            counter++;
            if(res.active === true){
                webHookMap[webhook._id] = webhook;
            } else {
                webhook.active = false;
                webHookMap[webhook._id] = webhook;
                setWebHookToFalse(webhook);
            }
            if(counter === webhooks.length){
                callback(null, "a");
            }
          });
        });
      },
      function(callback){

        var output = [];

        for (var key in webHookMap) {
            webHookMap[key].key = key;   // save key so you can access it from the array (will modify original data)
            output.push(webHookMap[key]);
        }

        output.sort(function(a,b) {
            return(a.updated_at - b.updated_at);
        });

        if(output === null){
          res.send("No webhooks here");
        } else {
          res.send(output);
        }
        callback(null, "b");
      }
      ]);

      //checkIfWebHookExistsAtTrello(webHookMap);
    });
  };

  var deleteAllWebhooksLocally = function(){
    WebHook.remove({}, function(){
    });
  };

  var findOneWebhook = function(req, res){
    WebHook.find({_id : req.params.id}, function(err, webhook){
      res.send(webhook);
    });
  };

  var setWebHookToFalse = function(webhookId){
    WebHook.findOne({_id : webhookId}, function(err, webhook){
              //console.log("The WebHook from Local (unmodified):");
              // console.log(webhook);
              webhook.active = false;
              webhook.save();
              //console.log(webhook);
    });
  };

  var updateOneWebhook = function(req, res){
    var responseFromTrello = "";

    async.series([
        function(callback){
            // t.get("/1/webhooks/" + req.body.webhooks_id, function (req, res) {
            //   console.log(res);
            //   callback(null, "a");
            // });

            t.put("/1/webhooks/" + req.body.webhooks_id, { description: req.body.desc_area, callbackURL: req.body.callback_area, idModel: req.body.idModel }, function (req, res) {
              responseFromTrello = res;
              callback(null, "a");
            });
        },

        function(callback){
          if(typeof responseFromTrello === "object"){
            WebHook.findOne({_id : req.body.webhooks_id}, function(err, webhook){
              //console.log("The WebHook from Local (unmodified):");
              // console.log(webhook);
              webhook.callbackURL = responseFromTrello.callbackURL;
              webhook.idModel = responseFromTrello.idModel;
              webhook.description = responseFromTrello.description;
              webhook.save();
            });
            res.status(200).send("it worked!");
            callback(null, "b");
          } else if(typeof responseFromTrello === "string"){
            res.status(418).send(responseFromTrello);
          }
        }
      ]);
  };

  var removeOneWebhook = function(req, res){
    var responseFromTrello = "";
    // console.log(req.body);
    async.series([
        function(callback){
            // t.get("/1/webhooks/" + req.body.webhooks_id, function (req, res) {
            //   console.log(res);
            //   callback(null, "a");
            // });

            t.del("/1/webhooks/" + req.body.webhooks_id, function (req, res) {
              responseFromTrello = res;
              callback(null, "a");
            });
        },

        function(callback){
          if(typeof responseFromTrello === "object"){
            // console.log(responseFromTrello);
              WebHook.findOne({ _id : req.body.webhooks_id }, function (err, webhook){
                webhook.remove();
                webhook.save();
                res.status(200);
                res.send("Deleted!");
                callback(null, "b");
              });
          } else if(typeof responseFromTrello === "string"){
            // console.log(responseFromTrello); - deletes it locally even if it does not exist at Trello
            //res.status(418).send(responseFromTrello);
            //
              WebHook.findOne({ _id : req.body.webhooks_id }, function (err, webhook){
                  webhook.remove();
                  webhook.save();
                  res.status(200);
                  res.send("Deleted!");
                  callback(null, "b");
              });
          }
        }
      ]);
  };

  var removeOneWebhookById = function (WebhookId){
    WebHook.findOne({ _id : WebhookId}, function (err, webhook){
        webhook.remove();
        webhook.save();
    });
  };

  // WebHooks API
  app.post("/mongies/webhooks/post", function (req, res){
    createNewWebhook(req, res);
  });

  app.get("/mongies/webhooks/deleteAll", function (){
    deleteAllWebhooksLocally();
  });

  app.get("/mongies/webhooks/all", function (req, res){
    getAllWebhooks(res);
  });

  app.get("/mongies/webhooks/findOne/:id", function (req,res){
    // Check if the WebHook exists at Trello! (Todo) - is this needed?
    findOneWebhook(req, res);
  });

  app.post("/mongies/webhooks/updateOne/", function (req, res){
    updateOneWebhook(req, res);
  });

  app.post("/mongies/webhooks/removeOne", function (req, res){
    removeOneWebhook(req, res);
  });
};