const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbytUUnWCA3I3JLdLOv8roTMu42qwK709WrJUwrCDYdzxM2tli82PZh7cKv1x3nzOtAT1A/exec';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

function loadPersonData() {
    fetch(WEBAPP_URL)
        .then(response => response.json())
        .then(data => {
            updateCompanyList('epec-bicentenario', data.filter(person => person.empresa === 'EPEC BICENTENARIO'));
            updateCompanyList('eling', data.filter(person => person.empresa === 'ELING'));
            updateCompanyList('epec-eor', data.filter(person => person.empresa === 'EPEC EOR'));
            updateCompanyList('others', data.filter(person => !['EPEC BICENTENARIO', 'ELING', 'EPEC EOR'].includes(person.empresa)));
        })
        .catch(error => console.error('Error loading person data:', error));
}

function updateCompanyList(id, people) {
    const list = document.getElementById(`${id}-list`);
    list.innerHTML = '';
    people.forEach(person => {
        const li = document.createElement('li');
        li.textContent = `${person.apellido}, ${person.nombre}`;
        if (person.patente) {
            li.textContent += ` (🚗 ${person.patente})`;
        }
        list.appendChild(li);
    });
}

function loadWeatherData() {
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const currentWeather = data.current_weather;
            const currentHour = new Date().getHours();
            const weatherHtml = `
                <div>
                    <p><i class="fas fa-thermometer-half"></i> Temperatura</p>
                    <p class="text-2xl font-bold">${currentWeather.temperature}°C</p>
                </div>
                <div>
                    <p><i class="fas fa-tint"></i> Humedad</p>
                    <p class="text-2xl font-bold">${data.hourly.relativehumidity_2m[currentHour]}%</p>
                </div>
                <div>
                    <p><i class="fas fa-wind"></i> Viento</p>
                    <p class="text-2xl font-bold">${currentWeather.windspeed} km/h</p>
                </div>
                <div>
                    <p><i class="fas fa-compass"></i> Dirección del viento</p>
                    <p class="text-2xl font-bold">${getWindDirection(currentWeather.winddirection)}</p>
                </div>
            `;
            document.getElementById('weather-data').innerHTML = weatherHtml;
        })
        .catch(error => console.error('Error loading weather data:', error));
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return directions[Math.round(degrees / 45) % 8];
}

function updateDashboard() {
    loadPersonData();
    loadWeatherData();
}

// Update the dashboard every 5 minutes
setInterval(updateDashboard, 5 * 60 * 1000);

// Initial update
updateDashboard();
