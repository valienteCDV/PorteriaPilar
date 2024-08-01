// Estas son las direcciones de donde obtendremos los datos
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbytUUnWCA3I3JLdLOv8roTMu42qwK709WrJUwrCDYdzxM2tli82PZh7cKv1x3nzOtAT1A/exec';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

// Esta función carga los datos de las personas en la planta
function loadPersonData() {
    // Fetch es como enviar una carta y esperar la respuesta
    fetch(WEBAPP_URL)
        .then(response => response.json()) // Convertimos la respuesta a un formato que podemos usar
        .then(data => {
            // Actualizamos la información en la página con los datos recibidos
            updatePeopleCount(data.totalPeople);
            updateCompanyList('other-companies', data.otherCompanies);
            updateCompanyList('epec-bicentenario', data.epecBicentenario);
            updateCompanyList('eling', data.eling);
            updateCompanyList('epec-eor', data.epecEor);
        })
        .catch(error => console.error('Error loading person data:', error)); // Si algo sale mal, mostramos un error
}

// Esta función actualiza el contador de personas en la planta
function updatePeopleCount(count) {
    document.getElementById('people-count').textContent = `Total en planta: ${count}`;
}

// Esta función actualiza la lista de personas para cada empresa
function updateCompanyList(id, people) {
    const list = document.getElementById(`${id}-list`);
    list.innerHTML = ''; // Limpiamos la lista existente
    people.forEach(person => {
        const li = document.createElement('li'); // Creamos un nuevo elemento de lista
        if (id === 'other-companies') {
            // Para otras empresas, mostramos el nombre de la empresa y la persona
            li.textContent = `${person.company}: ${person.name}`;
        } else {
            // Para las empresas principales, solo mostramos el nombre de la persona
            li.textContent = person.name;
        }
        if (person.vehicle) {
            // Si la persona tiene vehículo, lo añadimos a la información
            li.textContent += ` (🚗 ${person.vehicle})`;
        }
        list.appendChild(li); // Añadimos la persona a la lista
    });
}

// Esta función carga los datos del clima
function loadWeatherData() {
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const currentWeather = data.current_weather;
            const currentHour = new Date().getHours();
            // Creamos el HTML para mostrar la información del clima
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

// Esta función convierte los grados de dirección del viento a una dirección cardinal
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return directions[Math.round(degrees / 45) % 8];
}

// Esta función actualiza la fecha y hora mostradas
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('datetime').textContent = now.toLocaleDateString('es-AR', options);
}

// Esta función actualiza todo el dashboard
function updateDashboard() {
    loadPersonData();
    loadWeatherData();
    updateDateTime();
}

// Esto hace que el dashboard se actualice cada minuto
setInterval(updateDashboard, 60 * 1000);

// Esto actualiza el dashboard inmediatamente cuando se carga la página
updateDashboard();
