// URL de la API del clima
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

// URL de tu API de Google Apps Script (reemplaza con tu URL real)
const DATA_API_URL = 'https://script.google.com/macros/s/AKfycbx0G-MiPCDJRmVybfe6Xz70NJVPb3K3NHPcHz3DpGPbVfd8q2tTWZU_PU3Gv01ODbRVKA/exec';

// Función para cargar los datos del dashboard
function loadDashboardData() {
    fetch(DATA_API_URL)
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos:', data); // Para depuración

            document.getElementById('totalPersonas').textContent = data.totalPersonas;
            document.getElementById('camionesGasoil').textContent = data.camionesGasoil;
            
            const empresasContainer = document.getElementById('empresas-container');
            empresasContainer.innerHTML = '';
            
            const empresasOrden = ['EPEC BICENTENARIO', 'EPEC EOR', 'ELING', 'CONTRATISTAS Y VISITAS', 'CAMIONES DE GASOIL'];
            
            empresasOrden.forEach(empresaNombre => {
                const empresa = data.empresas.find(e => e.nombre === empresaNombre);
                if (empresa) {
                    const sectionClass = getSectionClass(empresaNombre);
                    const sectionIcon = getSectionIcon(empresaNombre);
                    
                    const empresaSection = document.createElement('div');
                    empresaSection.className = `col-md-6 col-lg-3`;
                    empresaSection.innerHTML = `
                        <div class="section ${sectionClass}">
                            <div class="section-header">
                                <i class="${sectionIcon}"></i> ${empresaNombre}
                            </div>
                            <div class="section-content">
                                ${empresa.personas.map(persona => `
                                    <div class="person">
                                        <i class="${getPersonIcon(persona)}"></i>
                                        ${persona.nombre} - ${persona.horaIngreso}
                                        ${persona.patente ? ` (${persona.patente})` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    empresasContainer.appendChild(empresaSection);
                }
            });
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
            document.getElementById('empresas-container').innerHTML = '<p>Error al cargar los datos. Por favor, intente nuevamente más tarde.</p>';
        });
}

// Función para determinar la clase de la sección
function getSectionClass(empresaNombre) {
    switch(empresaNombre) {
        case 'EPEC BICENTENARIO': return 'epec-bicentenario';
        case 'EPEC EOR': return 'epec-eor';
        case 'ELING': return 'eling';
        case 'CONTRATISTAS Y VISITAS': return 'contratistas';
        case 'CAMIONES DE GASOIL': return 'camiones';
        default: return '';
    }
}

// Función para determinar el icono de la sección
function getSectionIcon(empresaNombre) {
    switch(empresaNombre) {
        case 'EPEC BICENTENARIO': return 'fas fa-bolt';
        case 'EPEC EOR': return 'fas fa-cogs';
        case 'ELING': return 'fas fa-industry';
        case 'CONTRATISTAS Y VISITAS': return 'fas fa-hard-hat';
        case 'CAMIONES DE GASOIL': return 'fas fa-truck';
        default: return 'fas fa-building';
    }
}

// Función para determinar el icono correcto para cada persona
function getPersonIcon(persona) {
    if (persona.carga && persona.carga.toUpperCase().includes('GASOIL')) {
        return 'fas fa-truck';
    } else if (persona.patente) {
        return 'fas fa-car';
    } else {
        return 'fas fa-user';
    }
}

// Función para cargar los datos del clima
function loadWeatherData() {
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const currentWeather = data.current_weather;
            const currentHour = new Date().getHours();
            const weatherHtml = `
                <div class="weather-item">
                    <i class="fas fa-thermometer-half"></i>
                    <span>${currentWeather.temperature}°C</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-tint"></i>
                    <span>${data.hourly.relativehumidity_2m[currentHour]}%</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-wind"></i>
                    <span>${currentWeather.windspeed} km/h</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-compass"></i>
                    <span>${getWindDirection(currentWeather.winddirection)}</span>
                </div>
            `;
            document.getElementById('weather-data').innerHTML += weatherHtml;
        })
        .catch(error => {
            console.error('Error loading weather data:', error);
            document.getElementById('weather-data').innerHTML += '<p>Error al cargar datos del clima.</p>';
        });
}

// Función para convertir grados a dirección del viento
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return directions[Math.round(degrees / 45) % 8];
}

// Función para actualizar la fecha y hora
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('es-ES', options);
    document.getElementById('clock').textContent = now.toLocaleTimeString('es-ES');
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
