var bot = require(__dirname + '/../bot.js');

var https = require('https');

var action = {
    name: "youtube",

    trigger: /^youtube ".*"$/,

    description: "Display a random YouTube video similar to the way the 'gif' command does.",

    api_key: "AIzaSyAHD4juIcaWTRC-sDhspzbPYh-GQ5BXkbs",

    execute: function(data, callback) {
        var query_param = data.text.substring(data.text.indexOf('\"') + 1, data.text.length - 1);

        query_param = query_param.replace(/ /g,"+");

        console.log(data.text);

        // var url = "https://www.googleapis.com/youtube/v3/search?part=" + query_param + "&key=" + api_key;

        var options = {
            hostname: "www.googleapis.com",
            path : "/youtube/v3/search?part=snippet&q=" + query_param + "&key=" + this.api_key,
            port: 443,
            method: "GET"
        };

        console.log(options.hostname + options.path);

        var request = https.request(options, function(response) {
            var responseText = "";
            response.on("data", function(data) {
                responseText += data.toString();
            });
            response.on("end", function() {
                var videoArray = JSON.parse(responseText).items;
                var random_int = Math.floor(Math.random() * videoArray.length);
                var videoID = videoArray[random_int].id.videoId;
                var videoURL = "http://www.youtube.com/watch?v=" + videoID;
                callback(videoURL);
            });
        });

        request.end();

        request.on("error", function(error) {
            throw error;
        });
    }
};

bot.addAction(action);
