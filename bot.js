/**
 * bot.js
 *
 * @description: processes Slack requests and executes appropriate actions
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

var _ = require('lodash');

var fs = require('fs'),
    https = require('https'),
    querystring = require('querystring'),
    Slack = require('slack-node');

var config = require(__dirname + '/config.json'),
    log = require(__dirname + '/library/log.js'),
    parse = require(__dirname + '/library/parse.js');

var slack = {
  webhook: new Slack(config.token.webhook, config.domain),
  api:     new Slack(config.token.api)
};

exports.actions = [];

/**
 * setup()
 *
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
 *
 * @param: request {Object}
 * @param: response {Object}
 */
exports.processRequest = function processRequest(request, response) {
  var actionFound, commands, input, outgoingData, pipedResponse, regex, requestText, responseMethod, responseText, VARIABLES;
  
  input = request.body.text;

  // The keys on this object will
  VARIABLES = {
    'HERE': '#' + request.body.channel_name,
    'ME': '@' + request.body.user_name,
    'TODAY': new Date(Date.now()).toDateString(),
    'NOW': new Date(Date.now()).toLocaleTimeString(),
    'DOMAIN': request.body.team_domain
  };

  _.each(VARIABLES, function (value, key){
    regex = new RegExp('%24' + key, 'gm');
    input = input.replace(regex, value);
  });

  // Parse commands
  commands = parse.commands(input);
  responseMethod = (request.body.trigger_word) ? 'webhook' : 'api';

  if (request.body.trigger_word)
    requestText = parse.slackText(input.substring(request.body.trigger_word.length + 1, input.length));
  else {// command
    requestText = decodeURIComponent(input.replace(/\+/g, '%20'));
  }
  log.info('bot processing request', request.body, request.id);

  outgoingData = {
    channel_id:   request.body.channel_id,
    channel_name: request.body.channel_name,
    team_domain:  request.body.team_domain,
    team_id:      request.body.team_id,
    text:         requestText,
    timestamp:    request.body.timestamp,
    user_id:      request.body.user_id,
    user_name:    request.body.user_name
  };

  pipedResponse = null;


  _.each(commands, function (command) {
    actionFound = _.find(exports.actions, {name: command.name});

    // Actions desn't exist. Inform the user.
    if (!actionFound) {
      log.error('no bot action found', requestText, request.id);
      responseText = 'Invalid action, try `help`.';
      response.statusCode = 200;
      response.end(formatResponse(responseText));
    }

    // If the action hasn't completed in time, let the user know.
    setTimeout(function() {
      if (!responseText) {
        log.error('bot action timed out', actionFound.name, request.id);
        response.statusCode = 500;
        response.end();
      }
    }, config.timeout);

    outgoingData.command = _.clone(command);
    outgoingData.pipedResponse = _.clone(pipedResponse);
    actionFound.execute(outgoingData, function (actionResponse) {
      responseText = actionResponse;

      // No data back form the action.
      if (!responseText) {
        response.statusCode = 500;
        response.end();
        log.error('action did not return a response', actionFound.name, request.id);
        return;
      }

      // Success. Now, format the responseText.
      log.info('bot responding with action', actionFound.name, request.id);
      if (typeof responseText === 'string') {
        responseText.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
      } else {
        responseText = JSON.stringify(responseText);
      }

      // If the command should be piped, save the result.
      if (command.pipe) {
        pipedResponse = responseText;
        return true;
      } else {
        pipedResponse = null;
      }

      // If the response should be redirected, then do so
      if (command.redirectTo.length > 0) {
        _.each(command.redirectTo, function (redirect) {
          switch (redirect.type) {
            case 'user':
              exports.sendMessage(responseText, '@' + redirect.name);
              break;

            case 'channel':
              exports.sendMessage(responseText, '#' + redirect.name);          
              break;

            case 'group':
              exports.sendMessage(responseText, '#' + redirect.name);          
              break;

            case 'file':
              // Todo file creation/editing
              break;

            default:
              break;
          }
        });
        return true;
      }

      response.statusCode = 200;
      response.end(formatResponse(responseText));
      log.info('bot successfully responded', {}, request.id);

      return true;
    });

  });

  function formatResponse(response) {
    return (request.body.trigger_word) ? JSON.stringify({text: response}) : response;
  } 
};

/**
 * executeAction()
 *
 * @param: action {Object}
 */
exports.executeAction = function executeAction(action) {
};

/**
 * addAction()
 *
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
