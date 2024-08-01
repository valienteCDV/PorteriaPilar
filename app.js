// URL de la API del clima
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

// URL de tu API de Google Apps Script (reemplaza con tu URL real)
const DATA_API_URL = 'https://script.google.com/macros/s/AKfycbx0G-MiPCDJRmVybfe6Xz70NJVPb3K3NHPcHz3DpGPbVfd8q2tTWZU_PU3Gv01ODbRVKA/exec';

// Función para cargar los datos del dashboard
function loadDashboardData() {
    fetch(DATA_API_URL)
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalPersonas').textContent = data.totalPersonas;
            document.getElementById('camionesGasoil').textContent = data.camionesGasoil;
            
            const empresasContainer = document.getElementById('empresas-container');
            empresasContainer.innerHTML = '';
            
            data.empresas.forEach(empresa => {
                const empresaCard = document.createElement('div');
                empresaCard.className = 'empresa-card';
                empresaCard.innerHTML = `
                    <div class="empresa-title">${empresa.nombre} (${empresa.cantidad})</div>
                    ${empresa.personas.map(persona => `
                        <div class="persona-item">
                            <i class="${persona.carga.toUpperCase() === 'GASOIL' ? 'fas fa-truck' : (persona.patente ? 'fas fa-car' : 'fas fa-user')}"></i>
                            ${persona.nombre} - ${persona.horaIngreso}
                            ${persona.patente ? ` (${persona.patente})` : ''}
                        </div>
                    `).join('')}
                `;
                empresasContainer.appendChild(empresaCard);
            });
        })
        .catch(error => console.error('Error loading dashboard data:', error));
}

// Función para cargar los datos del clima
function loadWeatherData() {
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const currentWeather = data.current_weather;
            const currentHour = new Date().getHours();
            const weatherHtml = `
                <div>
                    <i class="fas fa-thermometer-half"></i>
                    <span>${currentWeather.temperature}°C</span>
                </div>
                <div>
                    <i class="fas fa-tint"></i>
                    <span>${data.hourly.relativehumidity_2m[currentHour]}%</span>
                </div>
                <div>
                    <i class="fas fa-wind"></i>
                    <span>${currentWeather.windspeed} km/h</span>
                </div>
                <div>
                    <i class="fas fa-compass"></i>
                    <span>${getWindDirection(currentWeather.winddirection)}</span>
                </div>
            `;
            document.getElementById('weather-data').innerHTML = weatherHtml;
        })
        .catch(error => console.error('Error loading weather data:', error));
}

// Función para convertir grados a dirección del viento
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return directions[Math.round(degrees / 45) % 8];
}

// Función para actualizar la fecha y hora
function updateDateTime() {
    const now = moment();
    document.querySelector('.header').textContent = `Central Bicentenario - ${now.format('dddd, D [de] MMMM [de] YYYY, HH:mm:ss')}`;
}

// Inicializar y actualizar periódicamente
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    loadWeatherData();
    updateDateTime();
    
    // Actualizar datos cada 5 minutos
    setInterval(loadDashboardData, 5 * 60 * 1000);
    setInterval(loadWeatherData, 30 * 60 * 1000);
    setInterval(updateDateTime, 1000);
});
