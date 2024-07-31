// ID de tu hoja de cálculo
const SPREADSHEET_ID = '1CnNiPEdb-MK8BI08ckAC0iLopSPCDTQlvNQ2EePU0tI';
const RANGE = 'PersonasAdentro!A:D';
const API_KEY = 'AIzaSyBhMaVzPTVDlQ5pTNAo3dV0ICmwGZ8o9B4';

// Función para cargar los datos de la hoja de cálculo
function loadSheetsData() {
  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (data.values && data.values.length > 0) {
        processData(data.values);
      } else {
        console.log('No data found.');
      }
    })
    .catch(error => console.error('Error loading sheet data:', error));
}

function processData(data) {
  const sections = {
    contratistas: document.getElementById('contratistas'),
    epecBicentenario: document.getElementById('epec-bicentenario'),
    eling: document.getElementById('eling'),
    epecEor: document.getElementById('epec-eor')
  };

  let total = 0;

  // Limpiar contenido existente
  Object.values(sections).forEach(section => section.innerHTML = '');

  data.forEach(row => {
    const [empresa, nombre] = row;
    let section;

    if (empresa === 'EPEC BICENTENARIO') section = sections.epecBicentenario;
    else if (empresa === 'ELING') section = sections.eling;
    else if (empresa === 'EPEC EOR') section = sections.epecEor;
    else section = sections.contratistas;

    const personElement = document.createElement('div');
    personElement.className = 'person';
    personElement.textContent = nombre;
    section.appendChild(personElement);

    total++;
  });

  document.getElementById('total').textContent = total;
}

// Función para actualizar el reloj
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toLocaleDateString();
  document.getElementById('clock').textContent = timeString;
  document.getElementById('date').textContent = dateString;
}

// Inicializar y actualizar periódicamente
function init() {
  loadSheetsData();
  updateClock();
  setInterval(loadSheetsData, 300000); // Actualizar datos cada 5 minutos
  setInterval(updateClock, 1000); // Actualizar reloj cada segundo
}

// Iniciar la aplicación cuando la página esté cargada
document.addEventListener('DOMContentLoaded', init);
