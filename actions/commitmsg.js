var bot = require(__dirname + '/../bot.js');
var $ = require('jquerygo');

var action = {
    name: "commitmsg",

    description: "Display a message from http://whatthecommit.com/",

    helpText: "Display a random message from http://whatthecommit.com/",

    execute: function(data, callback) {
        $.visit("http://whatthecommit.com/", function() {
            $("#content p:first-child").text(function(text) {
                if (text) {
                    callback(text);
                } else {
                    callback("Sorry. Something went wrong :disappointed:");
                }
                $.close();
            });
        });
    }
};

bot.addAction(action);