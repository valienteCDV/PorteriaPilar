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

    Object.values(sections).forEach(section => {
        if (section) {
            section.innerHTML = '';
            const sectionParent = section.closest('.section');
            if (sectionParent) sectionParent.style.display = 'none';
        }
    });

    const todasLasPersonas = data.map(row => ({
        empresa: row.empresa,
        apellido: row.nombreCompleto.split(' ')[0],
        nombre: row.nombreCompleto.split(' ').slice(1).join(' '),
        nombreCompleto: row.nombreCompleto,
        patente: row.patente,
        horaIngreso: new Date(row.horaIngreso),
        horaSalida: row.horaSalida ? new Date(row.horaSalida) : null,
        carga: row.carga
    }));

    const personasAdentro = todasLasPersonas.filter(p => !p.horaSalida);
    personasAdentro.sort((a, b) => a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' }));

    let totalPersonas = personasAdentro.length;
    let totalCamiones = 0;

    const empresasEspeciales = ['EPEC BICENTENARIO', 'ELING', 'EPEC EOR'];
    const contratistasData = {};

    personasAdentro.forEach(persona => {
        let section;
        if (empresasEspeciales.includes(persona.empresa)) {
            section = sections[persona.empresa.toLowerCase().replace(' ', '-')];
        } else {
            section = sections.contratistas;
            if (!contratistasData[persona.empresa]) {
                contratistasData[persona.empresa] = [];
            }
            contratistasData[persona.empresa].push(persona);
        }

        if (section && section !== sections.contratistas) {
            const personElement = document.createElement('div');
            personElement.className = 'person';
            const icon = persona.patente ? '🚗' : '';
            personElement.textContent = `${persona.nombreCompleto}${persona.patente ? ` (${icon} ${persona.patente})` : ''}`;
            section.appendChild(personElement);
        }

        if (persona.carga && persona.carga.toString().toUpperCase().trim() === 'GASOIL') {
            const camionElement = document.createElement('div');
            camionElement.className = 'person';
            camionElement.textContent = `${persona.nombreCompleto} (🚛 ${persona.patente || 'N/A'})`;
            if (sections.camiones) {
                sections.camiones.appendChild(camionElement);
            }
            totalCamiones++;
        }
    });

    document.getElementById('total-personas').textContent = totalPersonas;
    document.getElementById('total-camiones').textContent = totalCamiones;

    empresasEspeciales.forEach(empresa => {
        const sectionId = empresa.toLowerCase().replace(' ', '-');
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            const count = sectionElement.childElementCount;
            if (count > 0) {
                sectionElement.closest('.section').style.display = 'block';
                const headerElement = sectionElement.closest('.section').querySelector('.section-header');
                if (headerElement) {
                    headerElement.innerHTML = `${headerElement.innerHTML.split('<span')[0]} <span class="badge bg-secondary">${count}</span>`;
                }
            }
        }
    });

    if (Object.keys(contratistasData).length > 0) {
        processContratistas(contratistasData);
        sections.contratistas.closest('.section').style.display = 'block';
    }

    if (sections.camiones) {
        const camionesParent = sections.camiones.closest('.section');
        if (camionesParent) camionesParent.style.display = totalCamiones > 0 ? 'block' : 'none';
    }

    adjustLayout();
}

function processContratistas(contratistasData) {
    const contratistasSection = document.getElementById('contratistas');
    if (!contratistasSection) return;

    Object.entries(contratistasData).forEach(([empresa, personas]) => {
        const empresaElement = document.createElement('div');
        empresaElement.className = 'empresa-section';
        empresaElement.innerHTML = `<h4>${empresa}</h4>`;
        
        personas.forEach(persona => {
            const personElement = document.createElement('div');
            personElement.className = 'person';
            const icon = persona.patente ? '🚗' : '';
            personElement.textContent = `${persona.nombreCompleto}${persona.patente ? ` (${icon} ${persona.patente})` : ''}`;
            empresaElement.appendChild(personElement);
        });

        contratistasSection.appendChild(empresaElement);
    });
}

function adjustLayout() {
    const mainContent = document.getElementById('main-content');
    const visibleSections = mainContent.querySelectorAll('.section[style="display: block;"]');
    
    visibleSections.forEach(section => {
        section.classList.remove('col-md-6', 'col-lg-3', 'col-md-4', 'col-md-12');
        if (visibleSections.length === 3) {
            section.classList.add('col-md-4');
        } else if (visibleSections.length === 2) {
            section.classList.add('col-md-6');
        } else if (visibleSections.length === 1) {
            section.classList.add('col-md-12');
        } else {
            section.classList.add('col-md-6', 'col-lg-3');
        }
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
