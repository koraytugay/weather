const weatherObj = await fetchWeather();

// Thresholds for classification
const THRESHOLDS = {
  temp: { ideal: [2, 25], acceptable: [-5, 2] }, // < -5 = blocker
  wind: { ideal: [0, 14], acceptable: [14, 17] }, // > 17 = blocker
  cloud: { ideal: [0, 50], acceptable: [50, 100] },
};

function classify(value, { ideal, acceptable }) {
  if (value < ideal[0] || value > ideal[1]) {
    if (acceptable && value >= acceptable[0] && value <= acceptable[1])
      return "acceptable";
    return "blocker";
  }
  return "ideal";
}

async function fetchWeather() {
  const url =
      "https://api.open-meteo.com/v1/forecast?" +
      "forecast_days=2&latitude=43.70&longitude=-79.42" +
      "&hourly=temperature_2m,apparent_temperature,precipitation,precipitation_probability,relative_humidity_2m,windspeed_10m,cloudcover,uv_index" +
      "&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset" +
      "&timezone=America%2FNew_York";

  const response = await fetch(url);
  return await response.json();
}

// Split hours into today and tomorrow
function splitByDay(hourly) {
  const today = [];
  const tomorrow = [];
  for (let i = new Date().getHours(); i < 48; i++) {
    const target = i <= 23 ? today : tomorrow;
    target.push({
      hours: new Date(hourly.time[i]).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      temp: hourly.temperature_2m[i],
      feelsLike: hourly.apparent_temperature[i],
      precipitation: hourly.precipitation[i],
      precipitationProb: hourly.precipitation_probability[i],
      wind: hourly.windspeed_10m[i],
      cloudcover: hourly.cloudcover[i],
      humidity: hourly.relative_humidity_2m[i],
      uv: hourly.uv_index[i],
    });
  }
  return { today, tomorrow };
}

const { today: todaysData, tomorrow: tomorrowsData } = splitByDay(
    weatherObj.hourly
);

// Fill tables
fillTable("today", todaysData);
fillTable("tomorrow", tomorrowsData.slice(6)); // skip early morning tomorrow

function fillTable(id, data) {
  const tableBody = document.getElementById(id);
  data.forEach((rowData) => {
    tableBody.appendChild(getRow(rowData));
  });
}


function getRow(data) {
  let blockerExists = false;
  const row = document.createElement("tr");

  function makeCell(value, className) {
    const td = document.createElement("td");
    td.textContent = value;
    if (className) td.classList.add(className);
    if (className === "blocker") blockerExists = true;
    return td;
  }

  // Time
  row.appendChild(makeCell(data.hours));

  // Temperature
  row.appendChild(makeCell(`${data.temp}°`, classify(data.temp, THRESHOLDS.temp)));

  // Feels like
  row.appendChild(makeCell(`${data.feelsLike}°`, classify(data.feelsLike, THRESHOLDS.temp)));

  // Precipitation Probability
  row.appendChild(makeCell(`${data.precipitationProb}%`, data.precipitationProb < 30 ? "ideal" : data.precipitationProb < 60 ? "acceptable" : "blocker"));

  // Wind
  row.appendChild(makeCell(`${data.wind}`, classify(data.wind, THRESHOLDS.wind)));

  // Humidity
  row.appendChild(makeCell(`${data.humidity}%`, data.humidity < 60 ? "ideal" : data.humidity < 80 ? "acceptable" : "blocker"));

  if (blockerExists) {
    row.classList.add("blocker-row");
  }

  return row;
}
