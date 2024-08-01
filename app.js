const WEBAPP_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=T1T-Ksn1Vk-4SeKNOOkV8UInWaia9cX-M5A7IenztLnfxm6Fh9TNCKj-Ok3K2z5F5SAwStyVzMSn0xsCH5C3duX_exObaDkCm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnP4c9KToyw9YW6L56xXAJSipg1vKsN4HEjr0RUCJdnL_QlGwKAOjS4mazvbz4uUOtWCcL6933RJVAWBjFNo5rHZ3AXleNoPCNNz9Jw9Md8uu&lib=MCd94xyADNjRlrDad36TLIUfIMEvM9E86';
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
  console.log('Iniciando carga de datos...');
  fetch(WEBAPP_URL)
    .then(response => response.json())
    .then(data => {
      console.log('Datos recibidos:', data);
      processData(data);
    })
    .catch(error => console.error('Error loading data:', error));
}

function processData(data) {
  console.log('Procesando datos:', data);
  if (!data || !data.empresas || !Array.isArray(data.empresas)) {
    console.error('Formato de datos inválido:', data);
    return;
  }

  const sections = {
    epecBicentenario: document.querySelector('#epec-bicentenario .section-content'),
    epecEor: document.querySelector('#epec-eor .section-content'),
    eling: document.querySelector('#eling .section-content'),
    contratistas: document.querySelector('#contratistas .section-content')
  };

  // Limpiar contenido existente
  Object.values(sections).forEach(section => section.innerHTML = '');

  let totalPersonas = 0;
  let totalCamiones = 0;

  data.empresas.forEach(empresa => {
    let section;
    switch(empresa.nombre) {
      case 'EPEC BICENTENARIO':
        section = sections.epecBicentenario;
        break;
      case 'EPEC EOR':
        section = sections.epecEor;
        break;
      case 'ELING':
        section = sections.eling;
        break;
      default:
        section = sections.contratistas;
    }

    const headerElement = section.closest('.section').querySelector('.section-header');
    headerElement.innerHTML = `${headerElement.innerHTML.split('<span')[0]} <span class="badge bg-secondary">${empresa.cantidad}</span>`;

    empresa.personas.forEach(persona => {
      const personElement = document.createElement('div');
      personElement.className = 'person';
      const icon = persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : (persona.patente ? '🚗' : '👤');
      personElement.textContent = `${icon} ${persona.nombre}${persona.patente ? ` (${persona.patente})` : ''}`;
      section.appendChild(personElement);

      if (persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL') {
        totalCamiones++;
      }
    });

    totalPersonas += empresa.cantidad;
  });

  document.getElementById('total-personas').textContent = totalPersonas;
  document.getElementById('total-camiones').textContent = totalCamiones;
  document.getElementById('camionesGasoil').textContent = totalCamiones;
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('clock').textContent = timeString;
  document.getElementById('date').textContent = dateString;
}

function init() {
  loadSheetsData();
  updateClock();
  loadWeatherData();
  setInterval(loadSheetsData, 100000); // Actualizar datos cada 100 segundos
  setInterval(updateClock, 1000); // Actualizar reloj cada segundo
  setInterval(loadWeatherData, 600000); // Actualizar clima cada 10 minutos
}

document.addEventListener('DOMContentLoaded', init);
