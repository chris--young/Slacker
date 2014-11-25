/**
 * library/log.js
 * @description: debug log
 * @author: Chris Young <young.c.5690@gmail.com.com>
 */

var cluster = require('cluster'),
    fs = require('fs');

var config = require(__dirname + '/../config.json');

function format(type, message, data, id) {
  var speaker = cluster.isMaster ? 'master' : 'worker' + process.pid;
  var timestamp = Date.now();

  var dataObject = {
    type: type,
    speaker: speaker,
    message: message,
    data: data || {},
    id: id || '',
    timestamp: timestamp
  };

  var stringifiedData;
  try {
    stringifiedData = JSON.stringify(dataObject);
  } catch (exception) {
    throw exception;
  }

  return JSON.stringify(stringifiedData);
}

function writeToFile(fileName, dataString) {
  fs.appendFile(config.logs + '/' + fileName, dataString + '\n', function(error) {
    if (error)
      throw error;
  });

  fs.appendFile(config.logs + '/all.log', dataString + '\n', function(error) {
    if (error)
      throw error;
  });
}

exports.setup = function setup(callback) {
  fs.exists(config.logs, function(exists) {
    if (!exists)
      fs.mkdir(config.logs, function(exception) {
        if (exception)
          return callback(exception);

        callback();
      });
    else
      callback();
  });
};

exports.info = function info(message, data, id) {
  writeToFile('info.log', format('info', message, data, id));
};

exports.error = function error(message, data, id) {
  writeToFile('error.log', format('error', message, data, id));
};
