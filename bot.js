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
 * @param: <Function> callback
 */
exports.setup = function setup(callback) {
  fs.readdir(__dirname+'/actions', function readdir(error, files) {
    if (error)
      return callback(error, files);
  
    for (var x = 0; x < files.length; x++)
      require(__dirname+'/actions/'+files[x]);

    callback(null);
    log.info('bot setup complete');
  });
};

/**
 * processRequest()
 * @param: <Object> request
 * @param: <Object> response
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
    
  var actionFound,
      x = -1;

  function sendTimeout() {
    log.error('bot action timed out', exports.actions[x].trigger, request.id);
    response.end(500);
  }

  function sendResponse(responseText) {
    if (!responseText) {
      response.end(500);
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

    response.end(JSON.stringify({text: responseText}));
  }

  while (!actionFound && x++ < exports.actions.length - 1) {
    if (exports.actions[x].trigger.test(requestText)) {
      actionFound = true;
      
      setTimeout(sendTimeout, config.timeout);
      exports.actions[x].execute(requestData, sendResponse);
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
 * addAction()
 * @param: <Object> action
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
  log.info('Bot action added: '+action.name);

  return action;
};
