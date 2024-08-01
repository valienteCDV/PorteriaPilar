const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbytUUnWCA3I3JLdLOv8roTMu42qwK709WrJUwrCDYdzxM2tli82PZh7cKv1x3nzOtAT1A/exec';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

function loadPersonData() {
    fetch(WEBAPP_URL)
        .then(response => response.json())
        .then(data => {
            // Filtrar personas que no tienen hora de salida
            const peopleInside = data.filter(person => !person.horaSalida);
            
            updateCompanyList('epec-bicentenario', peopleInside.filter(person => person.empresa === 'EPEC BICENTENARIO'));
            updateCompanyList('eling', peopleInside.filter(person => person.empresa === 'ELING'));
            updateCompanyList('epec-eor', peopleInside.filter(person => person.empresa === 'EPEC EOR'));
            updateCompanyList('others', peopleInside.filter(person => !['EPEC BICENTENARIO', 'ELING', 'EPEC EOR'].includes(person.empresa)));
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
                    <i class="fas fa-thermometer-half text-xl"></i>
                    <span class="text-xl font-bold">${currentWeather.temperature}°C</span>
                </div>
                <div>
                    <i class="fas fa-tint text-xl"></i>
                    <span class="text-xl font-bold">${data.hourly.relativehumidity_2m[currentHour]}%</span>
                </div>
                <div>
                    <i class="fas fa-wind text-xl"></i>
                    <span class="text-xl font-bold">${currentWeather.windspeed} km/h</span>
                </div>
                <div>
                    <i class="fas fa-compass text-xl"></i>
                    <span class="text-xl font-bold">${getWindDirection(currentWeather.winddirection)}</span>
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

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('datetime').textContent = now.toLocaleDateString('es-AR', options);
}

function updateDashboard() {
    loadPersonData();
    loadWeatherData();
    updateDateTime();
}

// Update the dashboard every minute
setInterval(updateDashboard, 60 * 1000);

// Initial update
updateDashboard();
