const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbytUUnWCA3I3JLdLOv8roTMu42qwK709WrJUwrCDYdzxM2tli82PZh7cKv1x3nzOtAT1A/exec';

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

  data.forEach(entry => {
    let section;
    if (entry.tipo === 'persona') {
      if (entry.empresa === 'EPEC BICENTENARIO') section = sections.epecBicentenario;
      else if (entry.empresa === 'ELING') section = sections.eling;
      else if (entry.empresa === 'EPEC EOR') section = sections.epecEor;
      else section = sections.contratistas;

      const personElement = document.createElement('div');
      personElement.className = 'person';
      personElement.textContent = entry.nombreCompleto + (entry.patente ? ` (🚗 ${entry.patente})` : '');
      section.appendChild(personElement);
      totalPersonas++;
    } else if (entry.tipo === 'camion') {
      const camionElement = document.createElement('div');
      camionElement.className = 'person';
      camionElement.textContent = entry.nombreCompleto + (entry.patente ? ` (🚛 ${entry.patente})` : '');
      sections.camiones.appendChild(camionElement);
      totalCamiones++;
    }
  });

  document.getElementById('total-personas').textContent = totalPersonas;
  document.getElementById('total-camiones').textContent = totalCamiones;
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toLocaleDateString();
  document.getElementById('clock').textContent = timeString;
  document.getElementById('date').textContent = dateString;
}

function init() {
  loadSheetsData();
  updateClock();
  setInterval(loadSheetsData, 300000); // Actualizar datos cada 5 minutos
  setInterval(updateClock, 1000); // Actualizar reloj cada segundo
}

document.addEventListener('DOMContentLoaded', init);
