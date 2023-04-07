const weatherObj = await fetchWeather();

async function fetchWeather() {
  return fetch(
      "https://api.open-meteo.com/v1/forecast?forecast_days=2&latitude=43.70&longitude=-79.42&hourly=temperature_2m,precipitation,windspeed_10m,cloudcover&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FNew_York")
  .then(value => value.json());
}

let todaysData = [];
let tomorrowsData = [];

for (let i = new Date().getHours(); i <= 47; i++) {
  const arr = i <= 23 ? todaysData : tomorrowsData;
  const hourly = weatherObj.hourly;
  const data = {
    hours: new Date(hourly.time[i]).toLocaleString('en-US',
        {hour: 'numeric', minute: 'numeric', hour12: false}),
    precipitation: hourly.precipitation[i],
    temp: hourly.temperature_2m[i],
    wind: hourly.windspeed_10m[i],
    cloudcover: hourly.cloudcover[i],
  };
  arr.push(data);
}

const tableToday = document.getElementById("today");

for (let i = 0; i < todaysData.length; i++) {
  tableToday.appendChild(getRow(i, todaysData));
}

const tableTomorrow = document.getElementById("tomorrow");

for (let i = 6; i < tomorrowsData.length; i++) {
  tableTomorrow.appendChild(getRow(i, tomorrowsData));
}

function getRow(i, data) {
  let blockerExists = false;

  let row = document.createElement("tr");

  let time = document.createElement("td");
  time.textContent = data[i].hours;
  row.appendChild(time);

  let temp = document.createElement("td");
  temp.textContent = data[i].temp;
  if (data[i].temp < -5) {
    temp.classList.add("blocker");
    blockerExists = true;
  } else if (data[i].temp < 2) {
    temp.classList.add("acceptable");
  } else {
    temp.classList.add("ideal");
  }

  row.appendChild(temp);

  let precipitation = document.createElement("td");
  if (data[i].precipitation === 0) {
    precipitation.classList.add("ideal");
  }
  precipitation.textContent = data[i].precipitation;
  row.appendChild(precipitation);

  let wind = document.createElement("td");
  if (data[i].wind <= 14) {
    wind.classList.add("ideal");
  } else if (data[i].wind < 17) {
    wind.classList.add("acceptable");
  } else {
    wind.classList.add("blocker");
    blockerExists = true;
  }
  wind.textContent = data[i].wind;
  row.appendChild(wind);

  let cloudcover = document.createElement("td");
  cloudcover.textContent = data[i].cloudcover;
  if (data[i].cloudcover <= 50) {
    cloudcover.classList.add("ideal");
  } else if (data[i].cloudcover <= 100) {
    cloudcover.classList.add("acceptable");
  }


  if (blockerExists) {
    time.classList.add("blocker");
  }
  row.appendChild(cloudcover);

  return row;
}
