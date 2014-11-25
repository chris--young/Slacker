var fs = require('fs'),
    https = require('https'),
    querystring = require('querystring');

var bot = require(__dirname + '/../bot.js');
var config = require(__dirname +'/../config.json');
var slack = require(__dirname + '/../library/slack.js');

var action = {
  name: 'starwars',

  trigger: /^starwars$/,

  description: 'Star Wars ASCII cinema',

  frames: [],

  setup: function() {
    console.log('sw setup');
    fs.readFile(__dirname + '/../action_data/starwars.txt', function readFile(error, data) {
      if (error)
        throw error;

      action.frames = data.toString().split('[H');
    });
  },

  execute: function(data, callback) {
    if (!action.frames.length) 
      return callback('starwars.txt has not loaded yet, try again');

    callback(action.frames[0]);

    slack.sendMessage('foo', '#'+data.channel_name, function(error, response) {
      if (error)
        throw error;

      var query = {
        token: config.token.robot, 
        ts: response.ts,
        channel: response.channel,
        text: 'bar'
      };

      var options = {
        hostname: 'slack.com',
        path: '/api/chat.update?' + querystring.stringify(query),
        method: 'GET'
      };

      var request = https.request(options, function(response) {
        var responseBody = '';

        response.on('data', function(data) {
          responseBody += data.toString();
        });

        response.on('end', function() {
          console.log('edit response', responseBody);
        });
      });

      request.on('error', function(error) {
        throw error;
      });

      request.end();
    });
  }
};

// bot.addAction(action);
