var bot   = require(__dirname + '/../bot.js');
var https = require('https');

var action = {
  name: 'btc',

  description: 'Display the current asking price of BTC from Bitstamp.',

  execute: function(data, callback) {
    var options = {
      hostname: 'www.bitstamp.net',
      port: 443,
      path: '/api/ticker/',
      method: 'GET'
    };

    var request = https.request(options, function(response) {
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
    }).end();

    request.on('error', function(error) {
      throw error;
    });
  }
};

bot.addAction(action);
