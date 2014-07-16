var bot = require(__dirname + '/../bot.js');

var https = require('https');

var action = {
    name: "youtube",

    trigger: /^youtube ".*"$/,

    description: "Display a random YouTube video similar to the way the 'gif' command does.",

    api_key: "AIzaSyAHD4juIcaWTRC-sDhspzbPYh-GQ5BXkbs",

    execute: function(data, callback) {

        var query_param = data.text.substring(data.text.indexOf('\"') + 1, data.text.length - 1).replace(/ /g,"+");

        var options = {
            hostname: "www.googleapis.com",
            path : "/youtube/v3/search?part=snippet&q=" + query_param + "&key=" + this.api_key,
            port: 443,
            method: "GET"
        };

        var request = https.request(options, function(response) {
            var responseText = "";
            response.on("data", function(data) {
                responseText += data.toString();
            });
            response.on("end", function() {
                var videoArray = JSON.parse(responseText).items;
                if (videoArray.length > 0) {
                    var random_int = Math.floor(Math.random() * videoArray.length);
                    var videoID = videoArray[random_int].id.videoId;
                    var videoURL = "http://www.youtube.com/watch?v=" + videoID;
                    callback(videoURL);
                }
                else {
                    callback("No Videos Today :disappointed:");
                }
            });
        });

        request.on("error", function(error) {
            callback("Something wasn't right. :disappointed:");
            throw error;
        });

        request.end();
    }
};

bot.addAction(action);
