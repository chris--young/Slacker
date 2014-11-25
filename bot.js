/**
 * bot.js
 * @description: processes Slack requests and executes appropriate actions
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

var fs = require('fs'),
    https = require('https'),
    querystring = require('querystring');

var config = require(__dirname + '/config.json'),
    log = require(__dirname + '/library/log.js'),
    parse = require(__dirname + '/library/parse.js');

exports.actions = [];

/**
 * setup()
 * @param: callback {Function}
 */
exports.setup = function setup(callback) {
  fs.readdir(__dirname + '/actions', function readdir(error, files) {
    if (error)
      return callback(error, files);
  
    for (var x = 0; x < files.length; x++)
      require(__dirname + '/actions/' + files[x]);

    callback(null);
    log.info('bot setup complete');
  });
};

/**
 * processRequest()
 * @param: request {Object}
 * @param: response {Object}
 */
exports.processRequest = function processRequest(request, response) {
  var requestText = parse.slackText(request.body.text.substring(request.body.trigger_word.length + 1, request.body.text.length));
  log.info('bot processing request', request.body, request.id);

  var requestData = {
    team_id: request.body.team_id,
    team_domain: request.body.team_domain,
    channel_id: request.body.channel_id,
    channel_name: request.body.channel_name,
    timestamp: request.body.timestamp,
    user_id: request.body.user_id,
    user_name: request.body.user_name,
    text: requestText
  };
    
  var responseText,
      actionFound,
      x = -1;
  
  while (!actionFound && x++ < exports.actions.length - 1) {
    if (exports.actions[x].trigger.test(requestText)) {
      actionFound = true;
      setTimeout(function() {
        if (!responseText) {
          log.error('bot action timed out', exports.actions[x].trigger, request.id);
          response.statusCode = 500;
          response.end();
        }
      }, config.timeout);
  
      exports.actions[x].execute(requestData, function(responseText) {
        if (!responseText) {
          response.statusCode = 500;
          response.end();
          log.error('action did not return a response', exports.actions[x].trigger, request.id);
          return;
        }

        log.info('bot responding with action', exports.actions[x].trigger, request.id);
        if (typeof responseText === 'string') {
          responseText.replace('&', '&amp;');
          responseText.replace('<', '&lt;');
          responseText.replace('>', '&gt;');
        } else
          responseText = responseText.toString();

        response.statusCode = 200;
        response.end(JSON.stringify({text: responseText}));
        log.info('bot successfully responded', {}, request.id);
      });
    }
  }

  if (!actionFound) {
    log.error('no bot action found', requestText, request.id);
    responseText = 'Invalid action, try `help`.';
    response.statusCode = 200;
    response.end(JSON.stringify({text: responseText}));
  }
};

/**
 * executeAction()
 * @param: action {Object}
 */
exports.executeAction = function executeAction(action) {
};

/**
 * addAction()
 * @param: action {Object}
 */
exports.addAction = function addAction(action) {
  if (!action.description || !action.execute) {
    log.error('Invalid bot action', action);
    return false;
  }

  var existing;
  for (var x = 0; x < exports.actions.length; x++)
    if (exports.actions[x].name === action.name)
      existing = true;
  if (existing) {
    log.error('Bot action trigger collision', action.trigger);
    return false;
  }

  if (action.setup)
    action.setup();

  exports.actions.push(action);
  log.info('Bot action added: ' + action.name);

  return action;
};
