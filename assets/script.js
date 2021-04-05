var cityUlEl = document.querySelector("#city-search-history");
var currentWeather = document.querySelector("#big-weather-box");
var fiveDayWeather = document.querySelector("#five-day-forecast");
var citySearch = document.querySelector("#city-search");
var cityInput = document.querySelector("#city-input");

// call this function if the user clicks on a city in the recent search list
function cityClickHandler(event) {
    var whichCity = event.target.textContent;
    if (whichCity) {
        getSelectedCity(whichCity);
    }
}

//call this function if the user submits a new city search, clear the form and call getSelectedCity
function citySubmitHandler(event) {
    event.preventDefault();
    var whichCity = cityInput.value;
    cityInput.value = "";
    getSelectedCity(whichCity);
}

//we need a function that will query the openweathermap server and return the information we need for our weather data. Unfortunately we are going to have to make two seperate API calls to get everything we need... The "One Call API" could provide us with all of the information we need, but we cant call it by city name and instead have to use the Lat/Lon of a location. We need to call the "Current Weather Data" first which will provide us with the Lat/Lon data.
function getSelectedCity(theCity) {
    //generate the first API key with the selected city
    var apiUrl =
        `https://api.openweathermap.org/data/2.5/weather?q=
    ${theCity}&units=imperial&appid=ca0a6c1724abbeafa23dfc91590ac700`;
    //fetch the data and make sure its valid
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                //now lets extract the latitude and longitude from the first set of data to make our second api key
                var apiUrl2 = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly&units=imperial&appid=ca0a6c1724abbeafa23dfc91590ac700`;
                //fetch the second set of data and make sure its valid
                fetch(apiUrl2).then(function (response2) {
                    if (response2.ok) {
                        //we got the all the data about the city they selected, we need to call a function here to display it, lets update our local storage and search history here because we know we received a valid input
                        response2.json().then(function (dataUV) {
                            saveSearch(theCity);
                            updateCityList();
                            displayCity(data, dataUV);
                        });
                    }
                });
            });
        } else {
            //user did not provide a valid city name
            window.alert("City Not Found");
        }
    });
}


//this is our big daddy function that is going to dynamically generate all of our cards onscreen and populate them with the correct information. We can get all the information we need from dataUV except for the city name...
function displayCity(data, dataUV) {
    //clear the screen of any cards before we start creating new elements
    if (currentWeather) {
        currentWeather.innerHTML = "";
    }

    //lets dynamically create a new weather card for the selected city,
    var newCard = document.createElement("div");
    newCard.classList = "card bg-secondary text-white";
    var newBody = document.createElement("div");
    newBody.classList = "card-body";
    newBody.setAttribute("id", "weather-card");
    currentWeather.appendChild(newCard);
    newCard.appendChild(newBody);

    //lets add the city name and todays date
    var cityEl = document.createElement("h2");
    cityEl.textContent = `${data.name} ${moment().format("MM/DD/YYYY")}`;
    cityEl.classList = "card-title text-center";
    newBody.appendChild(cityEl);

    //lets add an icon to represent the weather
    var iconEl = document.createElement("img");
    iconEl.src =
        "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
    iconEl.classlist = "card-img text-center";
    newBody.appendChild(iconEl);

    //lets add the current temperature
    var tempEl = document.createElement("p");
    tempEl.textContent = "Temperature: " + data.main.temp + "℉";
    tempEl.classList.add("card-text");
    newBody.appendChild(tempEl);

    //lets add the current humidity
    var humEl = document.createElement("p");
    humEl.textContent = "Humidity: " + data.main.humidity;
    humEl.classList.add("card-text");
    newBody.appendChild(humEl);

    //lets add the current wind speed
    var windEl = document.createElement("p");
    windEl.textContent = "Wind Speed: " + data.wind.speed + " MPH";
    windEl.classList.add("card-text");
    newBody.appendChild(windEl);

    //we need to check the current UV Index in order to determine the color we want to show on the card
    var uvEl = document.createElement("p");
    if (dataUV.current.uvi <= 2) { // display green
        uvEl.innerHTML = `UV Index: <span class= "bg-success text-white rounded p-2">${dataUV.current.uvi}</span>`;
    } else if (dataUV.current.uvi > 2 && dataUV.current.uvi <= 7) { // display yellow
        uvEl.innerHTML = `UV Index: <span class= "bg-warning text-white rounded p-2">${dataUV.current.uvi}</span>`;
    } else { //display red
        uvEl.innerHTML = `UV Index: <span class= "bg-danger text-white rounded p-2">${dataUV.current.uvi}</span>`;
    }
    uvEl.classList.add("card-text");
    newBody.appendChild(uvEl);

    // that finishes up our single day / current weather card. now we need to print the 5 day forecast
    fiveDayWeather.innerHTML = "<h2>5-Day Forecast:</h2>";
    fiveDayWeather.classList = "mt-auto";

    //we need to dynamically create 5 cards for the forecast
    for (let i = 0; i < 5; i++) {
        //create a new card
        var forecastCard = document.createElement("div");
        forecastCard.classList = "card bg-primary text-white w-20 m-3";
        //lets make the cards display in a row
        forecastCard.setAttribute("style", "display:inline-block");
        //lets create the card body where the info will go and add them to the screen
        var forecastBody = document.createElement("div");
        forecastBody.classList = "card-body";
        forecastCard.appendChild(forecastBody);
        fiveDayWeather.appendChild(forecastCard);
        //lets create a card title with the forecast date
        var forecastDate = document.createElement("h5");
        forecastDate.textContent = moment()
            .add(i + 1, "d")
            .format("MM/DD/YYYY");
        forecastDate.classList = "card-title";
        forecastDate.setAttribute("style", "padding:0px 10px");
        forecastCard.appendChild(forecastDate);
        //lets create a weather icon for the card
        var forecastIcon = document.createElement("img");
        forecastIcon.src =
            "http://openweathermap.org/img/wn/" +
            dataUV.daily[i].weather[0].icon +
            ".png";
        forecastIcon.classList = "card-img";
        forecastIcon.setAttribute("style", "width:50px");
        forecastCard.appendChild(forecastIcon);
        //lets include the forecast temperature
        var forecastTemp = document.createElement("p");
        forecastTemp.textContent = `Temp: ${dataUV.daily[i].temp.day} ℉`;
        forecastCard.appendChild(forecastTemp);
        //finally lets add the forecast humidity
        var forecastHum = document.createElement("p");
        forecastHum.textContent = `Humidity: ${dataUV.daily[i].humidity}%`;
        forecastCard.appendChild(forecastHum);
    }
}

// we need a function that will save whatever city has been searched to local storage, and populate our list with the recent search history, lets make these seperate functions

//we should call this function within the citysubmithandler to save the data to local storage
function saveSearch(theCity) {
    //check to see if there is any search history in local storage
    var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (searchHistory) {
        //add the most recent search to history and submit to local storage
        searchHistory.push(theCity);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    } //there were no searchs in local storage, add the current search to local storage
    else {
        localStorage.setItem("searchHistory", JSON.stringify([theCity]));
    }
}

// we should call this function within the citysubmithandler to dynamically update the list of cities
function updateCityList() {
    //get the searchHistory from local storage
    var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    //lets clear the current list elements
    cityUlEl.innerHTML = "";
    //if we have an array with the search history, we need to loop through this array and create list elements to place on the side bar
    if (searchHistory) {
        for (let i = 0; i < searchHistory.length; i++) {
            var newCity = document.createElement("li");
            newCity.classList = "list-group-item";
            newCity.setAttribute("id", "city-menu");
            newCity.textContent = searchHistory[i];
            cityUlEl.appendChild(newCity);
        }
    }
}

//lets update the screen with any local storage data on page load
updateCityList();

//we need to listen for submissions from our search form and for clicks on our search history list
citySearch.addEventListener("submit", citySubmitHandler);
cityUlEl.addEventListener("click", cityClickHandler);
