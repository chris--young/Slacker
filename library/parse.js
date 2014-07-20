'use strict';

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
  var token = '';
  if (typeof tokens === 'string') {
    input = tokens;
    tokens = [{type: 'command', value: ''}];
  }

  input = exports.slackText(input);

  var chars = input.split('');

  var state = 'command';
  var quotes = '';
  var index = 0;
  var boundary = false;
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
          if (tokens[tokens.length - 1].value === '>') state = 'resource';
          else state = 'command';
        } 
        break;
    }

    if (boundary && !chars[index].match(/[ '"]/)) {
      tokens.push({type: state, value: (chars[index] !== ' ') ? chars[index] : ''});
      boundary = (state === 'operator');
    } else if (!chars[index].match(/[ '"]/)) {
      tokens[tokens.length - 1].value += chars[index];
      boundary = false;
    }

    index++;
  }
  return tokens;
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