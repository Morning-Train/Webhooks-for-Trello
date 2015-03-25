## Webhooks for Trello
Webhooks for Trello is made in NodeJS.

### Setting up "Webhooks for Trello".
#### 1:
You need to have NodeJS installed, you can get it here:
https://nodejs.org/download/

#### 2:
You need to have MongoDB installed, you can get it here:
http://www.mongodb.org/downloads

#### 3:
In your terminal write:


    $ git clone https://github.com/Morning-Train/Webhooks-for-Trello.git
    $ cd Webhooks-for-Trello
    $ npm install


The following modules will be installed:
- async, 0.9.0
- body-parser, 1.12.2
- express, 4.12.3
- mongoose, 3.8.25
- node-trello, 1.1.0


#### 4:
When your modules is installed, you need to open up config/config.js
Inside here you need set:

    config.trelloApplicationKey = "<<Insert your application key>>";
Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key

    config.trelloUserToken = "<<Insert your user token>>";
Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

#### 5:
At last you can call node app.js, and the server will (as standard) be running at localhost:3001

### Browser support
- IE10+
- Opera
- Chrome
- Firefox
- Safari

### Disclaimer
Please keep in mind, that we are not experts at NodeJS and "Webhooks for Trello"
was not made with security in mind, but made with the perspective of
"ease of use" - anything that is an issue or unwisely handled for an
example: functions, methods, datastructures, etc. Please report them
to us or make a pull request. (Suggestions are always welcome!).

Please notice that we are not affiliated, associated, authorized, endorsed by or in any way officially connected to Trello, Inc. (www.trello.com).
