var bot = require(__dirname + '/../bot.js'),
    https = require('https');

var action = {
  name: 'btc',

  trigger: /^btc$/,

  description: 'Display the current asking price of BTC from Bitstamp.',

  execute: function execute(data, callback) {
    var options = {
      hostname: 'www.bitstamp.net',
      path: '/api/ticker/',
      method: 'GET'
    };

    var request = https.request(options, function request(response) {
      var responseText = '';

      response.on('data', function(data) {
        responseText += data.toString();
      });

      response.on('end', function() {
        try {
          callback(JSON.parse(responseText).ask + ' USD');
        } catch (exception) {
          throw exception;
        }
      });
    });

    request.on('error', function(error) {
      throw error;
    });

    request.end();
  }
};

bot.addAction(action);
