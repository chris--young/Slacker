/**
 * library/slack.js
 *
 * @description: helper functions for the Slack API
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

var config = require(__dirname + '/../config.json');

var https = require('https'),
    querystring = require('querystring');

exports.refer = function refer(who) {
  return '<@' + who + '> ';
};

/**
 * sendMessage()
 *
 * @param: message {String}
 * @param: channel {String}
 * @param: callback {Function}
 */
exports.sendMessage = function sendMessage(message, channel, callback) {
  callback = callback || function () {};

  var messageData = {
    token: config.token.robot,
    channel: channel,
    text: message
  };

  var request = https.get('https://slack.com/api/chat.postMessage?' + querystring.stringify(messageData), function (response) {
    var responseBody = '';

    response.on('data', function(data) {
      responseBody += data.toString();
    });

    response.on('end', function() {
      try {
        responseBody = JSON.parse(responseBody);
      } catch (exception) {
        return callback(exception);
      }

      callback(response.error, responseBody);      
    });
  });
  
  request.end();
};
