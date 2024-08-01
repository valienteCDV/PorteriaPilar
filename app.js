const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbx0G-MiPCDJRmVybfe6Xz70NJVPb3K3NHPcHz3DpGPbVfd8q2tTWZU_PU3Gv01ODbRVKA/exec';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

function loadWeatherData() {
  fetch(WEATHER_API_URL)
    .then(response => response.json())
    .then(data => {
      const currentWeather = data.current_weather;
      const currentHour = new Date().getHours();
      updateWeatherDisplay(currentWeather, data.hourly.relativehumidity_2m[currentHour]);
    })
    .catch(error => console.error('Error loading weather data:', error));
}

function updateWeatherDisplay(weather, humidity) {
  const weatherHtml = `
    <div><span class="weather-icon"><i class="fas fa-thermometer-half"></i></span>${weather.temperature}°C</div>
    <div><span class="weather-icon"><i class="fas fa-tint"></i></span>${humidity}%</div>
    <div><span class="weather-icon"><i class="fas fa-wind"></i></span>${getWindDirection(weather.winddirection)} ${weather.windspeed} km/h</div>
  `;
  document.getElementById('weather-data').innerHTML = weatherHtml;
}

function getWindDirection(degrees) {
  const directions = ['Norte', 'NorEste', 'Este', 'SudEste', 'Sur', 'SudOeste', 'Oeste', 'NorOeste'];
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
    eling: document.querySelector('#eling .section-content'),
    otherCompanies: document.querySelector('#other-companies .section-content')
  };

  // Verificar que todos los elementos existan
  for (const [key, element] of Object.entries(sections)) {
    if (!element) {
      console.error(`Elemento no encontrado: ${key}`);
      return;
    }
  }

  // Limpiar contenido existente
  Object.values(sections).forEach(section => section.innerHTML = '');

  let totalPersonas = 0;
  let totalCamiones = 0;
  let companyData = {
    epecBicentenario: { count: 0, personas: [] },
    eling: { count: 0, personas: [] },
    others: {}
  };

  data.empresas.forEach(empresa => {
    if (empresa && typeof empresa.cantidad === 'number') {
      totalPersonas += empresa.cantidad;
    }
    if (empresa.personas && Array.isArray(empresa.personas)) {
      totalCamiones += empresa.personas.filter(p => p.carga && p.carga.toString().toUpperCase().trim() === 'GASOIL').length;

      if (empresa.nombre === 'EPEC BICENTENARIO') {
        companyData.epecBicentenario.count = empresa.cantidad;
        companyData.epecBicentenario.personas = empresa.personas;
      } else if (empresa.nombre === 'ELING') {
        companyData.eling.count = empresa.cantidad;
        companyData.eling.personas = empresa.personas;
      } else {
        companyData.others[empresa.nombre] = {
          count: empresa.cantidad,
          personas: empresa.personas
        };
      }
    }
  });

  // Mostrar EPEC BICENTENARIO
  displayCompanyPersonnel(sections.epecBicentenario, companyData.epecBicentenario.personas);
  updateSectionHeader('epec-bicentenario', companyData.epecBicentenario.count, totalPersonas);

  // Mostrar ELING
  displayCompanyPersonnel(sections.eling, companyData.eling.personas);
  updateSectionHeader('eling', companyData.eling.count, totalPersonas);

  // Mostrar otras empresas
  let otherCompaniesCount = 0;
  Object.entries(companyData.others).forEach(([companyName, company]) => {
    const companyCard = createCompanyCard(companyName, company.personas);
    sections.otherCompanies.appendChild(companyCard);
    otherCompaniesCount += company.count;
  });
  updateSectionHeader('other-companies', otherCompaniesCount, totalPersonas);

  const totalPersonasElement = document.getElementById('total-personas');
  if (totalPersonasElement) totalPersonasElement.textContent = totalPersonas;

  const totalCamionesElement = document.getElementById('total-camiones');
  if (totalCamionesElement) totalCamionesElement.textContent = totalCamiones;
}

function updateSectionHeader(sectionId, count, total) {
  const headerElement = document.querySelector(`#${sectionId} .section-header .badge`);
  if (headerElement) {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    headerElement.textContent = `${count} (${percentage}%)`;
  }
}


function displayCompanyPersonnel(section, personas) {
  if (!section || !Array.isArray(personas)) return;

  personas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  personas.forEach((persona, index) => {
    const personElement = document.createElement('div');
    personElement.className = 'person';
    const icon = persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : (persona.patente ? '🚗' : '');
    personElement.textContent = `${index + 1}. ${persona.nombre}${persona.patente ? ` (${icon}${persona.patente})` : ''}`;
    section.appendChild(personElement);
  });
}

function createCompanyCard(companyName, personas) {
  if (!companyName || !Array.isArray(personas)) return null;

  const card = document.createElement('div');
  card.className = 'company-card';
  card.innerHTML = `<h3>${companyName} <span class="badge bg-secondary">${personas.length}</span></h3>`;
  
  personas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  personas.forEach((persona, index) => {
    const personElement = document.createElement('div');
    personElement.className = 'person';
    const icon = persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : (persona.patente ? '🚗' : '');
    personElement.textContent = `${index + 1}. ${persona.nombre}${persona.patente ? ` (${icon}${persona.patente})` : ''}`;
    card.appendChild(personElement);
  });

  return card;
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  document.getElementById('clock').textContent = timeString;
}

function updateSafetyCalendar() {
  const lastAccidentDate = new Date('2019-12-17');
  const today = new Date();
  const daysSinceLastAccident = Math.floor((today - lastAccidentDate) / (1000 * 60 * 60 * 24));
  
  document.getElementById('days-without-accidents').textContent = daysSinceLastAccident;
  document.getElementById('last-accident-date').textContent = `Último accidente: 17/12/2019`;
}

function init() {
  loadSheetsData();
  updateClock();
  loadWeatherData();
  updateSafetyCalendar();
  setInterval(loadSheetsData, 100000); // Actualizar datos cada 100 segundos
  setInterval(updateClock, 1000); // Actualizar reloj cada segundo
  setInterval(loadWeatherData, 600000); // Actualizar clima cada 10 minutos
  setInterval(updateSafetyCalendar, 86400000); // Actualizar calendario de seguridad cada día
}

document.addEventListener('DOMContentLoaded', init);
