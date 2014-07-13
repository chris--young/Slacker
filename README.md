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

  Slacker processes Slack WebHook requests and executes pre-defined actions before responding to Slack. It deals with the networking aspects of your bot so you can focus on functionality.

## Setup

  1. Clone this repository.

    ````
    ➜ ~ git clone git@github.com:chris--young/Slacker.git
    ````

  2. Install [Node.js](http://node.js).

  3. Set Slack Integrations.

    * Create a Outgoing WebHook in Slack and point it to your instance of Slacker.

      * Slacker expects to receive requests directly to the server's root URL.

      * Be sure to include a valid `key` URL parameter on your outgoing-webhook URL when you set it in Slack.

    * Create an Incoming WebHook in Slack. 

      * Be sure to update `hostname` and `path` in `config.json` in match your incoming-webhook.

  4. Start Slacker.

    ````
    ➜ ~ sh Slacker 
    ````

## Actions

  Actions are script files located in the `bot_actions` directory. When Slacker receives a request from Slack it will check for and execute the appropriate action. Actions receive a `data` object with relevant information about the request from Slack, process the data and then return a response string. Slacker facilitates the response process.

### Creating an Action

  1. Create a new JavaScript file in the `actions/` directory.

  2. Require the `bot` module.

  3. Define your action as an object.

  4. Call `bot.addAction()` to complete the process. Slacker will search the `actions/` directory and add valid actions when worker processes come online.

### A Sample Action

  ````
  var bot = require(__dirname + '/../bot.js')

  var action = {
    trigger: 'echo',

    description: 'Echo a string to Slack.',

    setup: function() {
      // This method will be run at server start up.
    },

    execute: function(data) {
      return data.text.replace(this.trigger, '')
    }
  }

  bot.addAction(action)
  ````

#### Triggers

  Your action's `trigger` attribute defines when it will be exectued. If a Slack user activates your bot with the `trigger` keyword in his message text Slacker will perform your action. `trigger` attributes should be unique; Slacker will ignore actions if their `trigger` attributes have already been defined by another action. This attribute is required on all actions.

#### Description

  The `description` attribute is a string used to describe your action when a user triggers the __list__ action. This attribute is required on all actions.

#### Setup

  The `setup()` method will be run when Slacker worker processes come online. You can use this method for any pre-execution logic you may need to perform. This method is optional.

#### Execute

  Slacker calls the `execute()` method when a request requires that your action be performed. It receives a single `data` parameter with relavent request information and must return a string which will be the bot's response in Slack. This method is required on all actions.

##### The `data` Object

  ````
  var data = {
    team_id: 'T028JNZFM',
    team_domain: 'mobdev',
    channel_id: 'C02DCNQRN',
    channel_name: 'slacker-testing',
    timestamp: '1405215092.000210',
    user_id: 'U02A1R3PM',
    user_name: 'chris_young',
    text: 'echo foo'
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

