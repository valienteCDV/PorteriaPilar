const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbytUUnWCA3I3JLdLOv8roTMu42qwK709WrJUwrCDYdzxM2tli82PZh7cKv1x3nzOtAT1A/exec';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-31.6667&longitude=-63.8833&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m';

function loadWeatherData() {
    console.log('Iniciando carga de datos meteorológicos...');
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            console.log('Datos meteorológicos recibidos:', data);
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
    console.log('Iniciando carga de datos de la hoja...');
    fetch(WEBAPP_URL)
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos de la hoja:', data);
            processData(data);
        })
        .catch(error => console.error('Error loading sheet data:', error));
}

function processData(data) {
    console.log('Procesando datos:', data);
    const sections = {
        epecBicentenario: document.getElementById('epec-bicentenario'),
        epecEor: document.getElementById('epec-eor'),
        eling: document.getElementById('eling'),
        contratistas: document.getElementById('contratistas'),
        vehiculos: document.getElementById('vehiculos')
    };

    // Limpiar secciones
    Object.values(sections).forEach(section => {
        if (section) {
            section.innerHTML = '';
            const sectionParent = section.closest('.section');
            if (sectionParent) sectionParent.style.display = 'none';
        }
    });

    let totalPersonas = 0;
    let totalVehiculos = 0;
    let personasPorEmpresa = {
        epecBicentenario: 0,
        epecEor: 0,
        eling: 0,
        contratistas: 0
    };

    let contratistasData = {};

    data.forEach(entry => {
        if (entry.empresa !== "EMPRESA / ORGANIZACION") {  // Ignorar la entrada de encabezado
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

            if (section && section !== sections.contratistas) {
                const personElement = document.createElement('div');
                personElement.className = 'person';
                const icon = entry.patente ? '🚗' : '';
                personElement.textContent = `${entry.nombreCompleto}${entry.patente ? ` (${icon} ${entry.patente})` : ''}`;
                section.appendChild(personElement);
            }

            totalPersonas++;

            if (entry.patente) {
                const vehicleElement = document.createElement('div');
                vehicleElement.className = 'vehicle';
                vehicleElement.textContent = `${entry.nombreCompleto} (🚗 ${entry.patente})`;
                sections.vehiculos.appendChild(vehicleElement);
                totalVehiculos++;
            }
        }
    });

    document.getElementById('total-personas').textContent = totalPersonas;
    document.getElementById('total-vehiculos').textContent = totalVehiculos;

    // Actualizar contadores y mostrar secciones
    Object.entries(personasPorEmpresa).forEach(([empresa, count]) => {
        const sectionElement = document.getElementById(empresa);
        if (sectionElement && count > 0) {
            const sectionParent = sectionElement.closest('.section');
            if (sectionParent) {
                sectionParent.style.display = 'block';
                const headerElement = sectionParent.querySelector('.section-header');
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

    if (sections.vehiculos) {
        const vehiculosParent = sections.vehiculos.closest('.section');
        if (vehiculosParent) vehiculosParent.style.display = totalVehiculos > 0 ? 'block' : 'none';
    }

    adjustLayout();
}

function processContratistas(contratistasData) {
    console.log('Procesando contratistas:', contratistasData);
    const contratistasSection = document.getElementById('contratistas');
    if (!contratistasSection) {
        console.warn('Sección de contratistas no encontrada');
        return;
    }

    Object.entries(contratistasData).forEach(([empresa, personas]) => {
        console.log(`Procesando empresa: ${empresa}, Personas: ${personas.length}`);
        const empresaElement = document.createElement('div');
        empresaElement.className = 'empresa-section';
        empresaElement.innerHTML = `<h4>${empresa}</h4>`;
        
        personas.forEach(persona => {
            const personElement = document.createElement('div');
            personElement.className = 'person';
            const icon = persona.patente ? '🚗' : '';
            personElement.textContent = `${persona.nombreCompleto}${persona.patente ? ` (${icon} ${persona.patente})` : ''}`;
            empresaElement.appendChild(personElement);
