console.log("linked");

var cityListEl = document.querySelector("#city-menu");
var currentWeather = document.querySelector("#big-weather-box");
var fiveDayWeather = document.querySelector("#five-day-forecast");
var weatherCard = document.querySelector("#weather-card");
var citySearch = document.querySelector("#city-search");
var cityInput = document.querySelector("#city-input");
//var currentCard = document.querySelector(".card");

//currentCard.setAttribute("display", "none");

function cityClickHandler(event) {
  var whichCity = event.target.textContent;
  console.log(whichCity);
  if (whichCity) {
    getSelectedCity(whichCity);
  }
}

function citySubmitHandler(event) {
  event.preventDefault();
  var whichCity = cityInput.value;
  console.log(whichCity);
  cityInput.value = "";
  getSelectedCity(whichCity);
}

function getSelectedCity(theCity) {
  var apiUrl =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    theCity +
    "&units=imperial&appid=ca0a6c1724abbeafa23dfc91590ac700";

  console.log(apiUrl);
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      console.log(response);
      response.json().then(function (data) {
        console.log(data);
        var apiUrl2 =
          "https://api.openweathermap.org/data/2.5/onecall?lat=" +
          data.coord.lat +
          "&lon=" +
          data.coord.lon +
          "&exclude=minutely,hourly&units=imperial&appid=ca0a6c1724abbeafa23dfc91590ac700";
        fetch(apiUrl2).then(function (response2) {
          if (response2.ok) {
            response2.json().then(function (dataUV) {
              console.log(dataUV);
              displayCity(data, dataUV);
            });
          }
        });
        //we got the all the data about the city they clicked on, we need to call a function here to display it

        //displayCity(data);
      });
    } else {
      //did not get a valid response from the server
    }
  });
  // .catch(function (error) {alert('connection error')});
}

function displayCity(data, dataUV) {
  if (currentWeather) {
    currentWeather.innerHTML = "";
  }

  //lets dynamically create a new weather card for the selected city
  var newCard = document.createElement("div");
  newCard.classList = "card";
  var newBody = document.createElement("div");
  newBody.classList = "card-body";
  newBody.setAttribute("id", "weather-card");
  currentWeather.appendChild(newCard);
  newCard.appendChild(newBody);
  console.log(weatherCard);

  var cityEl = document.createElement("h2");
  cityEl.textContent = `${data.name} ${moment().format("MM/DD/YYYY")}`;
  cityEl.classList = "card-title text-center";
  newBody.appendChild(cityEl);

  var iconEl = document.createElement("img");
  iconEl.src =
    "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
  iconEl.classlist = "card-img text-center";
  newBody.appendChild(iconEl);

  var tempEl = document.createElement("p");
  tempEl.textContent = "Temperature: " + data.main.temp + "℉";
  tempEl.classList.add("card-text");
  newBody.appendChild(tempEl);

  var humEl = document.createElement("p");
  humEl.textContent = "Humidity: " + data.main.humidity;
  humEl.classList.add("card-text");
  newBody.appendChild(humEl);

  var windEl = document.createElement("p");
  windEl.textContent = "Wind Speed: " + data.wind.speed + " MPH";
  windEl.classList.add("card-text");
  newBody.appendChild(windEl);

  var uvEl = document.createElement("p");
  uvEl.textContent = "UV Index: " + dataUV.current.uvi;
  uvEl.classList.add("card-text");
  newBody.appendChild(uvEl);

  // that finishes up our single day / current weather card. now we need to print the 5 day forecast

  fiveDayWeather.innerHTML = "<h2>5-Day Forecast:</h2>";
  fiveDayWeather.classList = "mt-auto";

  //we need to dynamically create 5 cards for the forecast
  for (let i = 0; i < 5; i++) {
    var forecastCard = document.createElement("div");
    forecastCard.classList = "card bg-primary text-white w-20 m-3";
    
    forecastCard.setAttribute("style", "display:inline-block");
    var forecastBody = document.createElement("div");
    forecastBody.classList = "card-body";
    forecastCard.appendChild(forecastBody);
    fiveDayWeather.appendChild(forecastCard);
    var forecastDate = document.createElement("h5");
    forecastDate.textContent = moment()
      .add(i + 1, "d")
      .format("MM/DD/YYYY");
    forecastDate.classList = "card-title";
    forecastDate.setAttribute("style","padding:0px 10px")
    forecastCard.appendChild(forecastDate);
    var forecastIcon = document.createElement("img");
    forecastIcon.src =
      "http://openweathermap.org/img/wn/" +
      dataUV.daily[i].weather[0].icon +
      ".png";
    forecastIcon.classList = "card-img";
    forecastIcon.setAttribute("style", "width:50px");
    forecastCard.appendChild(forecastIcon);
    var forecastTemp = document.createElement("p");
    forecastTemp.textContent = `Temp: ${dataUV.daily[i].temp.day} ℉`;
    forecastCard.appendChild(forecastTemp);
    var forecastHum = document.createElement("p");
    forecastHum.textContent = `Humidity: ${dataUV.daily[i].humidity}%`;
    forecastCard.appendChild(forecastHum);
  }
}

citySearch.addEventListener("submit", citySubmitHandler);

cityListEl.addEventListener("click", cityClickHandler);
