// URLs para las APIs
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
    .catch(error => {
      document.getElementById('weather-data').innerHTML = 'Error al cargar datos del clima';
    });
}

function updateWeatherDisplay(weather, humidity) {
  const weatherHtml = `
    <div><i class="fas fa-thermometer-half"></i> ${weather.temperature}°C</div>
    <div><i class="fas fa-tint"></i> ${humidity}%</div>
    <div><i class="fas fa-wind"></i> ${getWindDirection(weather.winddirection)} ${weather.windspeed} km/h</div>
  `;
  document.getElementById('weather-data').innerHTML = weatherHtml;
}

function getWindDirection(degrees) {
  const directions = ['Norte', 'NorEste', 'Este', 'SudEste', 'Sur', 'SudOeste', 'Oeste', 'NorOeste'];
  return directions[Math.round(degrees / 45) % 8];
}

function loadSheetsData() {
  fetch(WEBAPP_URL)
    .then(response => response.json())
    .then(processData)
    .catch(error => {
      document.getElementById('total-personas').textContent = 'Error';
      document.getElementById('total-camiones').textContent = 'Error';
    });
}

function processData(data) {
  if (!data || !data.empresas || !Array.isArray(data.empresas)) {
    throw new Error('Formato de datos inválido');
  }

  const sections = {
    epecBicentenario: document.querySelector('#epec-bicentenario .section-content'),
    eling: document.querySelector('#eling .section-content'),
    otherCompanies: document.querySelector('#other-companies .section-content')
  };

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
      if (empresa.nombre === 'EPEC BICENTENARIO') {
        companyData.epecBicentenario = empresa;
      } else if (empresa.nombre === 'ELING') {
        companyData.eling = empresa;
      } else if (empresa.nombre) {
        companyData.others[empresa.nombre] = empresa;
      }
      totalCamiones += empresa.personas.filter(p => p.carga && p.carga.toString().toUpperCase().trim() === 'GASOIL').length;
    }
  });

  displayCompanyPersonnel(sections.epecBicentenario, companyData.epecBicentenario.personas);
  updateSectionHeader('epec-bicentenario', companyData.epecBicentenario.cantidad, totalPersonas);

  displayCompanyPersonnel(sections.eling, companyData.eling.personas);
  updateSectionHeader('eling', companyData.eling.cantidad, totalPersonas);

  let otherCompaniesCount = 0;
  Object.entries(companyData.others).forEach(([companyName, company]) => {
    const companyCard = createCompanyCard(companyName, company.personas);
    if (companyCard) {
      sections.otherCompanies.appendChild(companyCard);
      otherCompaniesCount += company.cantidad;
    }
  });
  updateSectionHeader('other-companies', otherCompaniesCount, totalPersonas);

  document.getElementById('total-personas').textContent = totalPersonas;
  document.getElementById('total-camiones').textContent = totalCamiones;
  updateLastUpdateTime();
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
  const fragment = document.createDocumentFragment();
  personas.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach((persona, index) => {
    const personElement = document.createElement('div');
    personElement.className = 'person';
    const icon = persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : (persona.patente ? '🚗' : '');
    personElement.textContent = `${index + 1}. ${persona.nombre}${persona.patente ? ` (${icon}${
