'use strict';

// NPM modules
var _           = require('lodash');
var fs          = require('fs');
var https       = require('https');
var querystring = require('querystring');

// Libraries
var config      = require(__dirname + '/library/config');
var log         = require(__dirname + '/library/log.js');
var parse       = require(__dirname + '/library/parse.js');

exports.actions = [];

exports.setup = function setup (callback) {
  var setup;
  var x;

  fs.readdir(__dirname + '/actions', function (error, files) {
    var errors = [];
    if (error) return callback(error, files);

    _.each(files, function (file) {
      require(__dirname + '/actions/' + file);
    });

    _.each(exports.actions, function runSetup (action) {
      setup = action.setup;
      if (setup && _.isFunction(setup)) setup(function (error, data) {
        console.log('Running setup of ' + file);
        if (error) {
          errors.push(error);
          log.error(new Error('error running setup function on ' + data.name));
        } else {
          log.info('Success running setup function of action' + data.name);
        }
      });

    });

    log.info('bot setup complete');
    callback((errors.length > 0) ? errors : null, exports.actions);
  });
};

exports.processRequest = function  processRequest (request, response) {
  var
    actionFound,
    commands,
    input,
    outgoingData,
    pipedResponse,
    regex,
    requestText,
    responseMethod,
    responseText,
    VARIABLES
  ;

  input = request.body.text;

  // The keys on this object will be replaced with their corresponding values
  // at runtime.
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

  requestText;
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

  responseText;
  actionFound;
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

      // User is ending their command with the `>`. Assume current room.
      if (command.redirects && !command.redirectTo.length) {
        command.redirectTo.push({ type: 'channel', name: request.body.channel_name });
      }

      // If the response should be redirected, then do so
      if (command.redirectTo.length > 0) {
        _.each(command.redirectTo, function (redirect) {
          console.log('Redirecting to: ', redirect.name);
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

  function formatResponse (response) {

    return (request.body.trigger_word) ? JSON.stringify({text: response}) : response;
  }
};

exports.addAction = function (action) {
  if (!action.description || !action.execute) {
    log.error('Invalid bot action', action);
    return false;
  }

  var existing = _.find(exports.actions, {name: action});

  if (existing) {
    log.error('Bot action trigger collision', action.trigger);
    return false;
  }

  log.info('Bot action added: ' + action.name);
  exports.actions.push(action);
  return action;
};

exports.sendMessage = function (message, channel, callback) {
  callback = callback || function () {};
  var messageData = {
    token: config.token.user,
    channel: channel,
    text: message
  };

  console.log('Sending message: ', JSON.stringify(messageData));
  var url = 'https://slack.com/api/chat.postMessage?' + querystring.stringify(messageData);
  https.get(url, function (response) {
    response.on('end', function () {
      console.log('Message sent');
      callback(response.error, response);
    });
  }).end();
};
