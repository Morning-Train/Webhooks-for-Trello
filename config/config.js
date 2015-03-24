/*=====================================================
=            Config of Webhooks for Trello            =
=====================================================*/
// Please notice that we are not affiliated, associated,
// authorized, endorsed by or in any way officially connected to Trello, Inc. (www.trello.com).

var config = {};

/* Trello API Access */
config.trelloApplicationKey = "<<Insert your application key>>"; // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "<<Insert your user token>>"; // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

/* Server port of Webhooks for Trello */
config.serverport = 3001;

/*-----  End of Config of Webhooks for Trello  ------*/
module.exports = config;
