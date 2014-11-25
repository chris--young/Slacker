var bot = require(__dirname + '/../bot.js');

var https = require('https');

var action = {
  name: 'gif',

  trigger: /^gif ".*"$/,

  description: 'Display a random GIF from Giphy.',

  apiKey: 'dc6zaTOxFJmzC',

  execute: function(data, callback) {
    tag = data.text == 'random' ? '' : data.text;
    this.requestTag(tag, callback);
  },

  requestTag: function (tag, callback) {
    var self = this;

    var options = {
      hostname: 'api.giphy.com',
      path: '/v1/gifs/random?api_key='+self.apiKey+(tag ? '&tag=' + encodeURIComponent(tag) : ''),
      method: 'GET'
    };

    var request = https.request(options, function(response) {
      var responseText = '';
      response.on('data', function(data) {
        responseText += data.toString();
      });
      response.on('end', function() {
        var output = JSON.parse(responseText).data;

        if (output instanceof Array) {
          self.requestTag("sad", function (url) {
            callback("No image found for that search :(\n"+url);
          });
        }
        else {
          try {
            callback(output.image_url);
          } catch (exception) {
            throw exception;
          }
        }
      });
    });
    request.end();

    request.on('error', function(error) {
      throw error;
    });
  }
};

bot.addAction(action);
