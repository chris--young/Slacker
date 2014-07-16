var bot = require(__dirname + '/../bot.js');

var http = require('http');

var action = {
    name: "weather",

    trigger: /^weather ".*"$/,

    description: "Display weather based on City or ZIP",

    execute: function(data, callback) {

        var query_param = data.text.substring(data.text.indexOf('\"') + 1, data.text.length - 1).replace(/ /g,"+");

        var options = {
            hostname: "api.openweathermap.org",
            path : "/data/2.5/find?q=" + query_param + "&mode=json",
            method: "GET"
        };

        var request = http.request(options, function(response) {
            var responseText = "";

            response.on("data", function(data) {
                responseText += data.toString();
            });

            response.on("end", function() {
                var responseJSON = JSON.parse(responseText);
                if (responseJSON.count > 0) {
                    var weather_list = responseJSON.list;
                    var weather_list_item = weather_list[0];
                    if (weather_list_item) {
                        var callback_data_str = "";

                        var name = weather_list_item.name;
                        var main = weather_list_item.main;
                        var temp_k = main.temp;
                        var temp_c = temp_k - 273.15;
                        var temp_f = ((temp_c * (9/5)) + 32).toFixed(2);;
                        var humidity = main.humidity;
                        var weather = weather_list_item.weather;
                        var forecast_str = "Forcast:\n";
                        for (var i = 0; i < weather.length; i++) {
                            var w_main = weather[i].main;
                            var w_icon = weather[i].icon;

                            forecast_str += "     " + w_main;
                            if (w_icon && w_icon.length > 0) {
                                forecast_str += ", :" + "weather_" + w_icon + ":";
                            }

                            if (i != weather.length - 1) {
                                forecast_str += "\n";
                            }
                        }

                        callback_data_str = "Weather for " + name + " is:\n     " + "Temperature of " + temp_f + "°F with a humidity of " + humidity + "%\n" + forecast_str;

                        callback(callback_data_str);
                    }
                    else {
                        callback("Something wasn't right :disappointed:");
                    }
                }
                else {
                    callback("Where you at, bruh? Try `looking out the window` to get a read on the situation...");
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
