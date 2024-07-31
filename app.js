const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbytUUnWCA3I3JLdLOv8roTMu42qwK709WrJUwrCDYdzxM2tli82PZh7cKv1x3nzOtAT1A/exec';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

function loadWeatherData() {
  fetch(WEATHER_API_URL)
    .then(response => response.json())
    .then(data => {
      const currentWeather = data.current_weather;
      const currentHour = new Date().getHours();
      const weatherHtml = `
        <p><i class="fas fa-thermometer-half"></i> Temperatura: ${currentWeather.temperature}°C</p>
        <p><i class="fas fa-tint"></i> Humedad: ${data.hourly.relativehumidity_2m[currentHour]}%</p>
        <p><i class="fas fa-wind"></i> Viento: ${currentWeather.windspeed} km/h</p>
        <p><i class="fas fa-compass"></i> Dirección del viento: ${getWindDirection(currentWeather.winddirection)}</p>
      `;
      document.getElementById('weather-data').innerHTML = weatherHtml;
    })
    .catch(error => console.error('Error loading weather data:', error));
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return directions[Math.round(degrees / 45) % 8];
}

function loadSheetsData() {
  fetch(WEBAPP_URL)
    .then(response => response.json())
    .then(data => {
      processData(data);
    })
    .catch(error => console.error('Error loading data:', error));
}

function processData(data) {
  const sections = {
    contratistas: document.getElementById('contratistas'),
    epecBicentenario: document.getElementById('epec-bicentenario'),
    eling: document.getElementById('eling'),
    epecEor: document.getElementById('epec-eor'),
    camiones: document.getElementById('camiones')
  };

  // Limpiar contenido existente
  Object.values(sections).forEach(section => section.innerHTML = '');

  let totalPersonas = 0;
  let totalCamiones = 0;
  let personasPorEmpresa = {
    contratistas: 0,
    epecBicentenario: 0,
    eling: 0,
    epecEor: 0
  };

  data.forEach(entry => {
    if (entry.horaSalida) return; // Ignorar entradas con hora de salida

    let section;
    if (entry.empresa === 'EPEC BICENTENARIO') {
      section = sections.epecBicentenario;
      personasPorEmpresa.epecBicentenario++;
    } else if (entry.empresa === 'ELING') {
      section = sections.eling;
      personasPorEmpresa.eling++;
    } else if (entry.empresa === 'EPEC EOR') {
      section = sections.epecEor;
      personasPorEmpresa.epecEor++;
    } else {
      section = sections.contratistas;
      personasPorEmpresa.contratistas++;
    }

    const personElement = document.createElement('div');
    personElement.className = 'person';
    personElement.textContent = `${entry.apellido}, ${entry.nombre}${entry.patente ? ` (🚗 ${entry.patente})` : ''}`;
    section.appendChild(personElement);
    totalPersonas++;

    if (entry.carga && entry.carga.toString().toUpperCase().trim() === 'GASOIL') {
      const camionElement = document.createElement('div');
      camionElement.className = 'person';
      camionElement.textContent = `${entry.apellido}, ${entry.nombre} (🚛 ${entry.patente || 'N/A'})`;
      sections.camiones.appendChild(camionElement);
      totalCamiones++;
    }
  });

  document.getElementById('total-personas').textContent = totalPersonas;
  document.getElementById('total-camiones').textContent = totalCamiones;

  // Actualizar contadores por empresa
  Object.entries(personasPorEmpresa).forEach(([empresa, count]) => {
    const countElement = document.createElement('div');
    countElement.className = 'text-end fw-bold';
    countElement.textContent = `Total: ${count}`;
    sections[empresa].appendChild(countElement);
  });
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('clock').textContent = timeString;
  document.getElementById('date').textContent = dateString;
}

function loadWeatherData() {
  fetch(WEATHER_API_URL)
    .then(response => response.json())
    .then(data => {
      const weatherHtml = `
        <p><i class="fas fa-thermometer-half"></i> Temperatura: ${data.main.temp}°C</p>
        <p><i class="fas fa-tint"></i> Humedad: ${data.main.humidity}%</p>
        <p><i class="fas fa-wind"></i> Viento: ${data.wind.speed} m/s</p>
        <p><i class="fas fa-cloud"></i> Descripción: ${data.weather[0].description}</p>
      `;
      document.getElementById('weather-data').innerHTML = weatherHtml;
    })
    .catch(error => console.error('Error loading weather data:', error));
}

function init() {
  loadSheetsData();
  updateClock();
  loadWeatherData();
  setInterval(loadSheetsData, 300000); // Actualizar datos cada 5 minutos
  setInterval(updateClock, 1000); // Actualizar reloj cada segundo
  setInterval(loadWeatherData, 600000); // Actualizar clima cada 10 minutos
}

document.addEventListener('DOMContentLoaded', init);
