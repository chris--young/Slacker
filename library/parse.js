'use strict';

var _ = require('lodash');
var uuid = require(__dirname  + '/id.js');

var delimiters = [' ', '|', '>', ';'];

var STATES = ['default', 'quotes', 'doubleQuotes', 'escape'];

var slackEncoding = {
  '+': ' ',
  '%26amp%3B': '&',
  '%26lt%3B': '<',
  '%26gt%3B': '>'
}
var slackChars = Object.keys(slackEncoding)

exports.httpParameters = function(parameters) {
  var parameters = parameters.split('&')
  var parametersObject = {}

  for (var x = 0; x < parameters.length; x++) {
    var components = parameters[x].split('=')
    parametersObject[components[0]] = components[1]
  }

  return parametersObject
}

exports.slackText = function(encodedText) {
  var decodedText = ''

  while (encodedText) {
    var charLength = 0
    while (charLength < 10) {
      var encodedChar = encodedText.substring(0, charLength)
      if (~slackChars.indexOf(encodedChar)) {
        decodedText += slackEncoding[encodedChar]
        encodedText = encodedText.substring(charLength, encodedText.length)
        charLength = undefined
      }
      charLength++
    }
    if (charLength) {
      if (encodedText[0] === '%') {
        try {
          decodedText += decodeURIComponent(encodedText.substring(0, 3))
          encodedText = encodedText.substring(3, encodedText.length) 
        } catch (exception) {
          decodedText += encodedText[0]
          encodedText = encodedText.substring(1, encodedText.length)
        }
      } else {
        decodedText += encodedText[0]
        encodedText = encodedText.substring(1, encodedText.length)
      }
    }
  }

  return decodedText
};

/**
 * Parses commands similar to a *nix terminal
 * @param  {Array} tokens Array of token objects (which have a type property and a value property)
 * @param  {String} input  String of commands
 * @return {Array}        Array of tokens, including commands, arguments, switches, resources, etc.
 */
function commands (tokens, input) {
  var commandId = '';
  if (typeof tokens === 'string') {
    input = tokens;
    tokens = [];
  }

  input = exports.slackText(input);

  var chars = input.split('');

  var state = 'operator';
  var quotes = '';
  var index = 0;
  var boundary = true;
  while (index < input.length) {
    switch (chars[index]) {
      case '\'':
        if (!quotes) {
          quotes = 'single';
        } else if (quotes === 'single') {
          boundary = true;
          quotes = '';
        } 
        break;

      case '"':
        if (!quotes) {
          quotes = 'double';
        } else if (quotes === 'double') {
          boundary = true;
          quotes = '';
        } 
        break;

      case '\\':
        index++;
        if (index === tokens.length) {
          throwParseError('Unexpected end of line.', input, index);
        }
        tokens[tokens.length - 1].value += chars[index];
        break;

      case ' ':
        if (quotes) {
          tokens[tokens.length - 1].value += chars[index];
          break;
        }
        boundary = true;
        break;

      case '|':
      case '>':
      case ';':
        boundary = true;
        state = 'operator';
        break;

      case '-':
        boundary = (state !== 'switch');
        state = 'switch';
        break;

      default:
        if (boundary && state === 'command' || state === 'switch') state = 'argument';
        if (boundary && state === 'operator') {
          if (tokens.length === 0) state = 'command';
          else if(tokens[tokens.length - 1].value === '>') state = 'resource';
          else state = 'command';
        } 
        break;
    }


    if (boundary && !chars[index].match(/[ '"]/)) {
      commandId = (state !== 'command') ? commandId : uuid();
      tokens.push({type: state, value: (chars[index] !== ' ') ? chars[index] : '', id: commandId});
      boundary = (state === 'operator');
    } else if (!chars[index].match(/[ '"]/)) {
      tokens[tokens.length - 1].value += chars[index];
      boundary = false;
    }

    index++;
  }
  return normalize(tokens);
}

function normalize (commands) {
  var normalizedCommands = [];

  _.each(commands, function (token) {
    var resourceTypes = {
      '@': 'user',
      '#': 'channel',
      '%': 'group',
      '/': 'file'
    };

    var thisCommand = _.find(normalizedCommands, {id: token.id});
    switch (token.type) {
      case 'command':
        token.arguments = [];
        token.switches = [];
        token.pipe = false;
        token.redirectTo = [];
        normalizedCommands.push(token);
        thisCommand = _.find(normalizedCommands, {id: token.id});
        break;

      case 'argument':
        thisCommand.arguments.push(token.value);
        break;

      case 'switch':
        if (token.value.indexOf('--') === 0) {
          thisCommand.switches.push(token.value.replace(/^-*/g, ''));
        } else {
          _.each(token.value.replace(/^-/, '').split(''), function (switchChar){
            thisCommand.switches.push(switchChar);
          });
        }
        thisCommand.switches = _.uniq(thisCommand.switches);
        break;

      case 'operator':
        if (token.value === '|') thisCommand.pipe = true;
        break;

      case 'resource':
        if (resourceTypes[token.value.substring(0,1)])
          thisCommand.redirectTo.push({type: resourceTypes[token.value.substring(0,1)] , name: token.value.substring(1)});
        else 
          thisCommand.redirectTo.push({type: 'file' , name: token.value});
        break;

      default:
        throw new Error('Parse error. ' + JSON.stringify(token));
        break;
    }
  });

  return normalizedCommands;
}

/** 
 * Creates a parsing Error and associated formatted message
 * @param  {String} error Error message to be displayed to the user
 * @param  {String} input String that was to be parsed when the error was thrown
 * @param  {Number} index Index within the input string where the error occured.
 * @return {Error}        This is expected to be caught.
 */
function throwParseError (error, input, index) {
  var errorPointer = '';
  var errorText = '';
  var i;

  for (i = 0; i < index; i++) {
    errorPointer += ' ';
  }

  errorPointer += '^';

  errorText = [error, input, errorPointer].join('\n');

  throw new Error(errorText);
}

exports.commands = commands;
