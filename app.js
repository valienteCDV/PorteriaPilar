const WEBAPP_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=T1T-Ksn1Vk-4SeKNOOkV8UInWaia9cX-M5A7IenztLnfxm6Fh9TNCKj-Ok3K2z5F5SAwStyVzMSn0xsCH5C3duX_exObaDkCm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnP4c9KToyw9YW6L56xXAJSipg1vKsN4HEjr0RUCJdnL_QlGwKAOjS4mazvbz4uUOtWCcL6933RJVAWBjFNo5rHZ3AXleNoPCNNz9Jw9Md8uu&lib=MCd94xyADNjRlrDad36TLIUfIMEvM9E86';
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
    <p><i class="fas fa-thermometer-half"></i> ${weather.temperature}°C</p>
    <p><i class="fas fa-tint"></i> ${humidity}%</p>
    <p><i class="fas fa-wind"></i> ${getWindDirection(weather.winddirection)} ${weather.windspeed} km/h </p>
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
    epecEor: document.querySelector('#epec-eor .section-content'),
    eling: document.querySelector('#eling .section-content'),
    contratistas: document.querySelector('#contratistas .section-content')
  };

  // Limpiar contenido existente
  Object.values(sections).forEach(section => section.innerHTML = '');

  let totalPersonas = 0;
  let totalCamiones = 0;

  data.empresas.forEach(empresa => {
    let section = sections[getCompanySection(empresa.nombre)];
    
    empresa.personas.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    if (empresa.nombre !== 'CONTRATISTAS Y VISITAS') {
      displayCompanyPersonnel(section, empresa);
    } else {
      displayContractors(section, empresa);
    }

    const headerElement = section.closest('.section').querySelector('.section-header');
    headerElement.innerHTML = `${headerElement.innerHTML.split('<span')[0]} <span class="badge bg-secondary">${empresa.cantidad}</span>`;

    totalPersonas += empresa.cantidad;
    totalCamiones += empresa.personas.filter(p => p.carga && p.carga.toString().toUpperCase().trim() === 'GASOIL').length;
  });

  document.getElementById('total-personas').textContent = totalPersonas;
  document.getElementById('total-camiones').textContent = totalCamiones;
}

function getCompanySection(companyName) {
  switch(companyName) {
    case 'EPEC BICENTENARIO': return 'epecBicentenario';
    case 'EPEC EOR': return 'epecEor';
    case 'ELING': return 'eling';
    default: return 'contratistas';
  }
}

function displayCompanyPersonnel(section, company) {
  company.personas.forEach((persona, index) => {
    const personElement = document.createElement('div');
    personElement.className = 'person';
    const icon = persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : (persona.patente ? '🚗' : '');
    personElement.textContent = `${index + 1}. ${persona.nombre}${persona.patente ? ` (${icon}${persona.patente})` : ''}`;
    section.appendChild(personElement);
  });
}

function displayContractors(section, contractorsData) {
  const contractorsByCompany = {};
  contractorsData.personas.forEach(persona => {
    if (!contractorsByCompany[persona.empresa]) {
      contractorsByCompany[persona.empresa] = [];
    }
    contractorsByCompany[persona.empresa].push(persona);
  });

  Object.entries(contractorsByCompany)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([companyName, personnel]) => {
      const companyElement = document.createElement('div');
      companyElement.className = 'contractor-company';
      companyElement.innerHTML = `<h4>${companyName}</h4>`;
      
      personnel.sort((a, b) => a.nombre.localeCompare(b.nombre));
      personnel.forEach((persona, index) => {
        const personElement = document.createElement('div');
        personElement.className = 'person';
        const icon = persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : (persona.patente ? '🚗' : '');
        personElement.textContent = `${index + 1}. ${persona.nombre}${persona.patente ? ` (${persona.patente}${icon})` : ''}`;
        companyElement.appendChild(personElement);
      });
      
      section.appendChild(companyElement);
    });
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('clock').textContent = timeString;
  document.getElementById('date').textContent = dateString;
}

function updateSafetyCalendar() {
  const lastAccidentDate = new Date('2019-12-17');
  const today = new Date();
  const daysSinceLastAccident = Math.floor((today - lastAccidentDate) / (1000 * 60 * 60 * 24));
  
  document.getElementById('days-without-accidents').textContent = daysSinceLastAccident;
  
  // Aquí iría el código para generar el calendario visual
  // Por ahora, solo mostraremos el número de días
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
