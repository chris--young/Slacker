var bot = require(__dirname + '/../bot.js');

var https = require('https');

var action = {
    name: "youtube",

    trigger: /^youtube ".*"$/,

    description: "Display a random YouTube video similar to the way the 'gif' command does.",

    api_key: "AIzaSyAHD4juIcaWTRC-sDhspzbPYh-GQ5BXkbs",

    execute: function(data, callback) {
        var query_param = data.text.substring(data.text.indexOf('\"') + 1, data.text.length - 1);

        // var url = "https://www.googleapis.com/youtube/v3/search?part=" + query_param + "&key=" + api_key;

        var options = {
            hostname: "www.googleapis.com",
            path : "/youtube/v3/search?part=" + query_param + "&key=" + this.api_key,
            method: "GET"
        };

        var request = https.request(options, function(response) {
            var responseText = "";
            response.on("data", function(data) {
                console.log("data: " + data);
                responseText += data.toString();
            });
            response.on("end", function() {
                console.log(responseText);
                callback(null);
                // callback("Data: " + JSON.stringify(responseText));
            });
            response.on("error", function(error) {
                throw error;
            });
        });
    }
};

bot.addAction(action);
