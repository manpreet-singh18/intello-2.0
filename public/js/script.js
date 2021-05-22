const locationFindInput = document.querySelector(".locationFindInput");
var textInput = document.querySelectorAll("input")[3];
const submit = document.querySelector("button");
const weatherInput = document.querySelector(".weatherInput");
const wordnetInput = document.querySelector(".wordnetInput");

//manupulating input placeholder text to give directions to user
weatherInput.addEventListener("click", function () {
    textInput.removeAttribute("disabled");
    textInput.classList.remove("effect");
    textInput.style.fontStyle = "italic";
    textInput.placeholder = "Enter the location Name";
});
wordnetInput.addEventListener("click", function () {
    textInput.removeAttribute("disabled");
    textInput.classList.remove("effect");
    textInput.style.fontStyle = "italic";
    textInput.placeholder = "Enter a word to find its defination";
});

locationFindInput.addEventListener("click", function () {
    // targetting text field to get dimmed and disabled when user chose to find location 
    textInput.setAttribute("disabled", "true");
    textInput.placeholder = "Click on Search button to find your location";
    textInput.classList.add("effect");
    // finding latitude and longitude via html geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var location_obj = {
                lattitude: position.coords.latitude,
                longitude: position.coords.longitude,
                service: "locationFinder",
                from: "radioClickEvent"
            }
            //making a post request to server to store lat and lon variables
            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(location_obj)
            });
        });
    }
});