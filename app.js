// URLs para las APIs
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbx0G-MiPCDJRmVybfe6Xz70NJVPb3K3NHPcHz3DpGPbVfd8q2tTWZU_PU3Gv01ODbRVKA/exec';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

/**
 * Carga los datos meteorológicos de la API
 */
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

/**
 * Actualiza la visualización del clima en el dashboard
 * @param {Object} weather - Datos del clima actual
 * @param {number} humidity - Humedad actual
 */
function updateWeatherDisplay(weather, humidity) {
  const weatherHtml = `
    <div class="d-flex justify-content-between align-items-center">
      <div><i class="fas fa-thermometer-half"></i> ${weather.temperature}°C</div>
      <div><i class="fas fa-tint"></i> ${humidity}%</div>
      <div><i class="fas fa-wind"></i> ${getWindDirection(weather.winddirection)} ${weather.windspeed} km/h</div>
    </div>
  `;
  document.getElementById('weather-data').innerHTML = weatherHtml;
}

/**
 * Obtiene la dirección del viento basada en los grados
 * @param {number} degrees - Grados de dirección del viento
 * @returns {string} Dirección del viento en texto
 */
function getWindDirection(degrees) {
  const directions = ['Norte', 'NorEste', 'Este', 'SudEste', 'Sur', 'SudOeste', 'Oeste', 'NorOeste'];
  return directions[Math.round(degrees / 45) % 8];
}

/**
 * Carga los datos de la hoja de cálculo desde la API de Google Apps Script
 */
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

/**
 * Procesa los datos recibidos y actualiza el dashboard
 * @param {Object} data - Datos recibidos de la API
 */
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

  // Procesar datos de cada empresa
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

  // Mostrar datos de cada empresa
  displayCompanyPersonnel(sections.epecBicentenario, companyData.epecBicentenario.personas);
  updateSectionHeader('epec-bicentenario', companyData.epecBicentenario.count, totalPersonas);

  displayCompanyPersonnel(sections.eling, companyData.eling.personas);
  updateSectionHeader('eling', companyData.eling.count, totalPersonas);

  let otherCompaniesCount = 0;
  Object.entries(companyData.others).forEach(([companyName, company]) => {
    const companyCard = createCompanyCard(companyName, company.personas);
    sections.otherCompanies.appendChild(companyCard);
    otherCompaniesCount += company.count;
  });
  updateSectionHeader('other-companies', otherCompaniesCount, totalPersonas);

  // Actualizar totales
  document.getElementById('total-personas').textContent = totalPersonas;
  document.getElementById('total-camiones').textContent = totalCamiones;

  // Actualizar tiempo de última actualización
  updateLastUpdateTime();
}

/**
 * Actualiza el encabezado de una sección con el conteo y porcentaje
 * @param {string} sectionId - ID de la sección a actualizar
 * @param {number} count - Cantidad de personas en la sección
 * @param {number} total - Total de personas en todas las secciones
 */
function updateSectionHeader(sectionId, count, total) {
  const headerElement = document.querySelector(`#${sectionId} .section-header .badge`);
  if (headerElement) {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    headerElement.textContent = `${count} (${percentage}%)`;
  }
}

/**
 * Muestra el personal de una empresa en su sección correspondiente
 * @param {HTMLElement} section - Elemento donde mostrar el personal
 * @param {Array} personas - Array de personas a mostrar
 */
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

/**
 * Crea una tarjeta para una empresa en la sección "Otros"
 * @param {string} companyName - Nombre de la empresa
 * @param {Array} personas - Array de personas de la empresa
 * @returns {HTMLElement} Elemento de tarjeta de empresa
 */
function createCompanyCard(companyName, personas) {
  if (!companyName || !Array.isArray(personas)) return null;

  const card = document.createElement('div');
  card.className = 'company-card';
  card.innerHTML = `<h3>${companyName} <span class="badge bg-secondary">${personas.length}</span></h3>`;
  
  const personList = document.createElement('div');
  personas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  personas.forEach((persona, index) => {
    const personElement = document.createElement('div');
    personElement.className = 'person';
    const icon = persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL' ? '🚛' : (persona.patente ? '🚗' : '');
    personElement.textContent = `${index + 1}. ${persona.nombre}${persona.patente ? ` (${icon}${persona.patente})` : ''}`;
    personList.appendChild(personElement);
  });
  
  card.appendChild(personList);
  return card;
}

/**
 * Actualiza el reloj y la fecha de última actualización
 */
function updateClock() {
    const now = new Date();
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    };
    document.getElementById('clock').textContent = now.toLocaleString('es-AR', options).replace(',', '');
}

/**
 * Actualiza la hora de la última actualización de datos
 */
function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString('es-AR');
}

/**
 * Actualiza el calendario de accidentes
 */
function updateAccidentCalendar() {
    const lastAccidentDate = new Date('2019-12-17');
    const today = new Date();
    const daysSinceLastAccident = Math.floor((today - lastAccidentDate) / (1000 * 60 * 60 * 24));
    
    document.getElementById('days-without-accidents').textContent = daysSinceLastAccident;
    document.getElementById('last-accident-date').textContent = `Último accidente: ${lastAccidentDate.toLocaleDateString('es-AR')}`;
    
    // Aquí iría la lógica para generar el calendario visual
    // Por ahora, solo mostraremos el número de días
}

/**
 * Inicializa la aplicación y configura las actualizaciones periódicas
 */
function init() {
    updateClock();
    updateAccidentCalendar();
    loadWeatherData();
    loadSheetsData();
    setInterval(updateClock, 1000);
    setInterval(loadWeatherData, 600000); // Cada 10 minutos
    setInterval(loadSheetsData, 300000); // Cada 5 minutos
    setInterval(updateAccidentCalendar, 86400000); // Cada día
}

// Iniciar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', init);
