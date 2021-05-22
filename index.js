const express = require("express");
const bodyParser = require("body-parser");
const natural = require('natural');
const wordnet = new natural.WordNet();
const https = require("https");
const app = express();
// setting up packages
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static("public"));
//variables
var word = "";
var info = [];
var location = "";
var information = {};
var forcast_info = [];
var lattitude;
var longitude;
var location_obj;
var weatherDataHolder = "";
var forecastDataHolder = "";
var locationDataHolder = "";
//object making function
function Object_maker(forcast_date, min_temp, main_description, description, temp, image) {
    this.forcast_date = forcast_date;
    this.min_temp = min_temp;
    this.main_description = main_description;
    this.description = description;
    this.temperature = temp;
    this.image = image;
}
// handling get requests on root
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

// handling get request for wordnet
app.get("/wordnet", function (req, res) {
    //looking for the match of the word in the database
    wordnet.lookup(word, function (details) {
        info = [];
        var size = details.length;
        for (let i = 0; i < size && i < 4; i++) {
            info.push(details[i]);
        }
    });

    function wait() {
        res.render('wordnet', {
            wordData: info,
            word: word,
            page: "wordnet"
        });
    }
    setTimeout(wait, 1000);
});
// handling get request for weather
app.get("/weather", function (req, res) {
    if (location != "") {
        const apiKey = "fdfdbab10ff62740dce9fdc4ede20c17";
        const weather_url = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=metric&appid=" + apiKey;
        const forcast_url = "https://api.openweathermap.org/data/2.5/forecast?q=" + location + "&units=metric&appid=" + apiKey;
        //making API call to get the weather information
        https.get(weather_url, function (response) {
            weatherDataHolder = "";
            response.on('data', function (data) {
                const weatherData = JSON.parse(data);
                const icon_id = weatherData.weather[0].icon;
                information = {
                    country: weatherData.sys.country,
                    imageAddress: "http://openweathermap.org/img/w/" + icon_id + ".png",
                    temperature: weatherData.main.temp,
                    feel_like: weatherData.main.feels_like,
                    country_name: location[0].toLocaleUpperCase() + location.slice(1),
                    description: weatherData.weather[0].description,
                    main_description: weatherData.weather[0].main
                }

            });


        });
        //making API call to get upcoming weather information
        https.get(forcast_url, function (response) {
            response.on("data", function (data) {
                forcast_info = [];
                const forcast = JSON.parse(data);
                for (let i = 0; i < 6; i++) {
                    var forcast_date = forcast.list[i].dt_txt;
                    var temperature = forcast.list[i].main.temp;
                    var min_temp = forcast.list[i].main.temp_min;
                    var main_description = forcast.list[i].weather[0].main;
                    var description = forcast.list[i].weather[0].description;
                    var icon = forcast.list[i].weather[0].icon;
                    const imageAddress = "http://openweathermap.org/img/w/" + icon + ".png";
                    var forcast_object = new Object_maker(forcast_date, min_temp, main_description, description, temperature, imageAddress);
                    forcast_info.push(forcast_object);
                }
            });
        });

        function wait() {
            res.render('weather', {
                weather_info: information,
                page: "weather",
                forcast_information: forcast_info
            });
        }
        setTimeout(wait, 3000);
    } else {
        res.redirect("/");
    }
});
// handling get request for location finder
app.get("/locationFinder", function (req, res) {
    if (lattitude == undefined || longitude == undefined) {
        res.redirect("/");
    }
    const url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lattitude + "&longitude=" + longitude + "&localityLanguage=en";
    //making API call to get the reverse geocoding information that is country,state or city
    https.get(url, function (response) {

        response.on("data", function (data) {
            const location_data = JSON.parse(data);
            location_obj = {
                country: location_data.countryName,
                continent: location_data.continent,
                country_code: location_data.countryCode,
                state: location_data.principalSubdivision,
                state_code: location_data.principalSubdivisionCode,
                city: location_data.city,
                locality: location_data.locality

            }
        });
    });


    function wait() {
        res.render("location", {
            location_info: location_obj,
            page: "locationFinder",
            longitude: longitude,
            lattitude: lattitude
        });
    }
    setTimeout(wait, 1500);



});
// handling post requests
app.post("/", function (req, res) {
    var service = req.body.service;

    if (service == "wordnet") {
        word = req.body.inputData;
        res.redirect("/wordnet");
    } else if (service == "locationFinder") {
        try {
            if (req.body.from == "radioClickEvent") {
                lattitude = req.body.lattitude;
                longitude = req.body.longitude;
                res.end();
            } else {
                res.redirect("/locationFinder");
            }
        } catch (error) {
            console.log("error in post handling");
        }


    } else if (service == "weather") {
        location = req.body.inputData;
        res.redirect("/weather");
    } else {
        res.redirect("/");
    }
});

// starting the server at port 3000
app.listen(process.env.PORT || 3000, function () {
    console.log("server is running on port 3000");
});