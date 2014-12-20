"use strict";

var fs = require('fs');
var config;

var configExists = fs.existsSync(__dirname + '/../config.json');

if (!configExists) {
  config = {
    "port": 8421,
    "logs": "logs",
    "token": {
      "slashCommand": process.env.TOKEN_SLASH_COMMAND,
      "user": process.env.USER
    },
    "timeout": 8000
  };
} else {
  config = require(__dirname + '/../config.json');
}

console.log('Using config:' + JSON.stringify(config));

module.exports = config;
