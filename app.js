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
  const sections = {
    epecBicentenario: document.getElementById('epec-bicentenario'),
    epecEor: document.getElementById('epec-eor'),
    eling: document.getElementById('eling'),
    contratistas: document.getElementById('contratistas'),
    camiones: document.getElementById('camiones')
  };

  // Limpiar contenido existente
  Object.values(sections).forEach(section => section.innerHTML = '');

  let totalPersonas = 0;
  let totalCamiones = 0;
  let personasPorEmpresa = {
    epecBicentenario: 0,
    epecEor: 0,
    eling: 0,
    contratistas: 0
  };

  let contratistasData = {};

  data.forEach(entry => {
    if (!entry.horaSalida) {  // Solo procesar entradas sin hora de salida
      let section;
      if (entry.empresa === 'EPEC BICENTENARIO') {
        section = sections.epecBicentenario;
        personasPorEmpresa.epecBicentenario++;
      } else if (entry.empresa === 'EPEC EOR') {
        section = sections.epecEor;
        personasPorEmpresa.epecEor++;
      } else if (entry.empresa === 'ELING') {
        section = sections.eling;
        personasPorEmpresa.eling++;
      } else {
        section = sections.contratistas;
        personasPorEmpresa.contratistas++;
        if (!contratistasData[entry.empresa]) {
          contratistasData[entry.empresa] = [];
        }
        contratistasData[entry.empresa].push(entry);
      }

      if (section !== sections.contratistas) {
        const personElement = document.createElement('div');
        personElement.className = 'person';
        const icon = entry.carga && entry.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : '🚗';
        personElement.textContent = `${entry.nombreCompleto}${entry.patente ? ` (${icon} ${entry.patente})` : ''}`;
        section.appendChild(personElement);
      }

      totalPersonas++;

      if (entry.carga && entry.carga.toString().toUpperCase().trim() === 'GASOIL') {
        const camionElement = document.createElement('div');
        camionElement.className = 'person';
        camionElement.textContent = `${entry.nombreCompleto} (🚛 ${entry.patente || 'N/A'})`;
        sections.camiones.appendChild(camionElement);
        totalCamiones++;
      }
    }
  });

  document.getElementById('total-personas').textContent = totalPersonas;
  document.getElementById('total-camiones').textContent = totalCamiones;

  // Actualizar contadores por empresa y mostrar/ocultar secciones
  Object.entries(personasPorEmpresa).forEach(([empresa, count]) => {
    const sectionElement = document.getElementById(empresa);
    if (count > 0) {
      sectionElement.style.display = 'block';
      const headerElement = sectionElement.querySelector('.section-header');
      headerElement.innerHTML += ` <span class="badge bg-secondary">${count}</span>`;
    } else {
      sectionElement.style.display = 'none';
    }
  });

  // Procesar contratistas
  processContratistas(contratistasData);
}

function processContratistas(contratistasData) {
  const contratistasSection = document.getElementById('contratistas');
  Object.entries(contratistasData).forEach(([empresa, personas]) => {
    const empresaElement = document.createElement('div');
    empresaElement.className = 'empresa-section';
    empresaElement.innerHTML = `<h4>${empresa}</h4>`;
    
    personas.forEach(persona => {
      const personElement = document.createElement('div');
      personElement.className = 'person';
      const icon = persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : '🚗';
      personElement.textContent = `${persona.nombreCompleto}${persona.patente ? ` (${icon} ${persona.patente})` : ''}`;
      empresaElement.appendChild(personElement);
    });

    contratistasSection.appendChild(empresaElement);
  });
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
