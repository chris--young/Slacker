````
   .d8888b.   888                      888
  d88P  Y88b  888                      888
  Y88b.       888                      888
   "Y888b.    888   d888b.    .d8888b  888  .888  .d88b.   888d88b
      "Y88b.  888      "88b  d88P"     888 .88P  d8P  Y8b  888P"
        "888  888  .d888888  888       888888K   88888888  888
  Y88b  d88P  888  888  888  Y88b.     888 "88b  Y8b.      888
   "Y8888P"   888  "Y888888   "Y8888P  888  .888  "Y888P   888
````

### Slacker is a bot for [Slack](https://slack.com) built on the Node.js platform.

  Slacker processes Slack Slash Command requests and executes pre-defined actions before responding to Slack. It deals with the networking aspects of your bot so you can focus on functionality.

## Setup

  1. Clone this repository.

    ````
    ➜ ~ git clone git@github.com:chris--young/Slacker.git
    ````

  2. Install [Node.js](http://node.js).

  3. Set Slack Integrations.

    * Create a Slash Command integration in Slack and point it to your instance of Slacker.

      * Slacker expects to receive requests directly to the server's root URL.

      * Be sure to note the token for this Slash Command, as you will need it for the configuration file.

    * Create an Bot integration in Slack.

  4. Create a `config.json` file. Note that a `sample-config.json` is included in this package. You can simply copy this, and replace the two token values with the tokens that you noted above.

  ````json
  {
    "port": 80,
    "logs": "logs",
    "token": {
      "slashCommand": "[Enter your Slash Command token here.]",
      "bot": "[Enter your Bot token here.]"
    },
    "timeout": 8000
  }
  ````

  5. Start Slacker.

    ````
    ➜ ~ sh Slacker
    ````
## Using Slacker

  Slacker uses a command-line-like syntax. To interact with Slacker, use the Slash Command that you previously set up. For demonstration purposes, we'll assume that you named it `/slacker`.

  One of the most basic uses of Slacker is to get a list of commands. To do this, on an empty input line in Slack, type

    ````
    ➜ /slacker list
    ````

  Assuming that everything is set up correctly, you should now see a list of commands. Note that these are returned to you through Slackbot, which only you can see.

  Another useful action is __help__. If you wanted to learn how to use the `gif` action, for instance, you could use the following command.

    ````
    ➜ /slacker help gif
    ````

  This time, we sent 'gif' as an argument for __help__. Beware that different actions may use arguments differently, so pay attention to their help. If you want to send multiple words as single argument, simply wrap them in quotes like so.

    ````
    ➜ /slacker gif "Homer Simpson"
    ````

  Alternately, you can escape a space like so.

    ````
    ➜ /slacker gif Peter/ Griffin
    ````

  If you want to pass in quotes as part of an argument, you can escape them as well.

    ````
    ➜ /slacker echo "The worm looked up at me and said, \"I'd like to poison your mind.\""
    ````

  You can also redirect where the output goes through the use of the `>` character, which is often used to redirect output on a terminal to a file. Valid targets include rooms,

    ````
    ➜ /slacker gif daily kitten > #general
    ````

  and users.

    ````
    ➜ /slacker btc > @stewie_griffin
    ````

  One of the more powerful features of Slacker is the user of pipes (`|`), where you can pipe the output of one action into the input of the next.

    ````
    ➜ /slacker btc | echo
    ````

  (Yes, I know that example is lame, but our actions catalogue is a bit light at the moment.)

## Actions

  Actions are script files located in the `actions/` directory. When Slacker receives a request from Slack it will check for and execute the appropriate action. Actions receive a `data` object with relevant information about the request from Slack and the command that triggered it, process the data and then return a response string. Slacker facilitates the response process.

### Creating an Action

  1. Create a new JavaScript file in the `actions/` directory.

  2. Require the `bot` module.

  3. Define your action as an object.

  4. Call `bot.addAction()` to complete the process. Slacker will search the `actions/` directory and add valid actions when worker processes come online.

### A Sample Action

  ````javascript
  // Loads all of the bot functionality.
  var bot = require(__dirname + '/../bot.js');

  var action = {
    // This is the string that will
    name: 'echo',

    // Used for the `list` action.
    description: 'Echo a string to Slack.',

    // Used for the `help` action.
    helpText: 'Echo a string to Slack.',

    setup: function() {
      // This method will be run at server start up.
    },

    execute: function(data, callback) {
      // If piped data is provided, send that, otherwise send any text passed in.
      callback( data.pipedResponse || data.command.arguments.join(' ') );
    }
  };

  // Adds this action to the action list.
  bot.addAction(action);
  ````

#### Name

  The `name` attribute defines your action. It is used by the __help__ and __list__ actions to inform users about your action. `name` attributes must be unique; Slacker will ignore actions if their `name` has already been defined by another action. This attribute is required on all actions.

#### Description

  The `description` attribute is a string used to describe your action when a user triggers the __list__ action. This attribute is required on all actions.

#### Setup

  The `setup()` method will be run when Slacker worker processes come online. You can use this method for any pre-execution logic you may need to perform. This method is optional.

#### Execute

  Slacker calls the `execute()` method when a request requires that your action be performed. It receives a `data` parameter with relavent request information, and a `callback` paramature that must return a string which will be the bot's response in Slack. This method is required on all actions.

##### The `data` Object

  ````javascript
  data === {
    "channel_id": "D02DVPT67",
    "channel_name": "directmessage",
    "team_domain": "ustice",
    "team_id": "T02DVPT63",
    "text": "echo \"This is a test of the Emergency Broadcast System.\"",
    "user_id": "U02DVPT65",
    "user_name": "ustice",
    "command": {
      "name": "echo",
      "id": "A230317A-82C7-4FA5-91A8-92DFEFB49C06",
      "arguments": [
        "This is a test of the Emergency Broadcast System."
      ],
      "switches": [],
      "pipe": false,
      "redirectTo": []
    },
    "pipedResponse": null
  }
  ````

## Tests

  Slacker uses [Mocha](https://www.npmjs.org/package/mocha) for testing. To run the tests first install Mocha.

  ````
  ➜ ~ npm install -g mocha
  ````

  Then run the tests.

  ````
  ➜ ~ npm test
  ````
