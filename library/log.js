var cluster = require('cluster');
var fs = require('fs');

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

  return JSON.stringify(dataObject);
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

exports.info = function(message, data, id) {
  writeToFile('info.log', format('info', message, data, id));
};

exports.error = function(message, data, id) {
  writeToFile('error.log', format('error', message, data, id));
};
