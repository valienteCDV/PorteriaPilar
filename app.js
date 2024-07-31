// ID de tu hoja de cálculo
const SPREADSHEET_ID = '1rHCBn3gEw2S0m4bEqBXX5ZJj6OkMlWGPTR3EgNAcuX0';
const RANGE = 'PersonasAdentro!A:D';

// Credenciales de la cuenta de servicio
const CREDENTIALS = {
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDzHFJxyVUeMnrx\nk+QXT8NSzspZ79Skj19sKxtMQW+Br4CE4l2g+XmGV5tqWG9j/BYkqgSfAdkpE425\nXJPVmDYoRGSH/exWBLmEdaIrM5pTPnAGpG6ouzD/csQE5ZFRkG2lNXzbAmsRYDfz\neEDNYJ4vqUec0rfOTKL1frH1oBq997PS1MfMDJkrl7TMs+m9wN77tXp9VHLk1osP\nZoILSMUINcNTor+GpRNvku0pVDqLPhpeCZgwKAWybcNptUsAFtJ1EAJVHVp/87aS\nzBlLzAMxikjZyY/XfpJDWytFwrxNha2rl+9bSYbFPcxiye94e+B/OQPW55OMtX73\nNRjdrMVfAgMBAAECggEAFeCjmV0ejXl0z46ZL8aGyPSWXczpBudmv+uKfldD0JjZ\nk5vHWeLOyS8oa5k1FPtXhsnMtqkflhm4tEic09OUdBU2Ms1qr5GnRutLF7YsxMxR\nSoJmTvA23ZYXW8AeTrJqRjwaVfR8Fsk2NRvKQRvZFb2XFd7EmbUTKSJ9+KEFfGNu\n4uoApECwtlsZyoY+PKiBM/uMwZ8jWFnJrhLZInr3G/h2WACtajNyOqoqkqO/lN7d\nY1VRPYm3idJ3QRbtQMLE7HJkeTevY1JSQzVAdr275cfDfjP77MjnbnZdTRcNIE2v\n6hKNKrkjR0cAOeYAP5mVGYCI6QK4vxmsv+UhL53WwQKBgQD6zKzsXVqmgEqxZGSZ\nbM9WZF5qdZ9fZo4SoPXjP3AAWBhwMD9aDEm+RUeyaHxhtQGqgTFwOPOX/LkO+nhx\nF7uuoDrKtcd6kk81OKjeZN8RHPHrROkT4ckx8IKQvQ9q8QViYLYG9i5yaHPSJbA6\nbBWtRQcftQ0YBJrdxQPpDK4wvwKBgQD4JtTeJ+1jWgldRrYY7uJCpC9QKeqoAsUa\n5TUdXwzNW4/VT2M4GA93rvUZhsPexW7DbVDNe5kWCH9PlyZZ/H7zMRLQtPWv/gFT\n1q3Mqb33S8BRKyj/ThBKQcgTas6CmTE2KeqULGcsBAYljHthjPpj4gWvVxJqb+EM\nsMH5e1nzYQKBgQDTQb0XjLtjLQW9zzb+Fa3As+LkAhgxIA3kmzkEJteNMqfDOKDk\nlR047Nqr6V98Xh/9I74lLZPjHrozZ8A0Yy1wtv9O6TgSg1O9HPECBC3yGFOfPfin\nCrWTH2ibyuVFy6ghah1qV8xgCqQlDCIZ1BmeTlrl1nglFxvsWpwkns3LuQKBgAeI\n9lHAmJ65rysb6I+dQVWQsrcWbr+nReDpMNGxfywFKbrqbDLZ2C5kK6EYzH3JNPHO\nMfPrWtymaWc7SbjVx+0Ogmm/9O3hIp0vGZvrU49cx3wveVE3R5tZn/+m8JpamHny\nj+Lr7j4R6TXerChsJXY++Lk4RaDhwM2n2FwA+NxBAoGBAOUy5OeiivoLdfitxd+W\nlWH2++vHarOFPkJYRb6kXJWVDTWd1qsOdT5m0F8V3ysjkmxuiGkgEeZ/eHQcYoou\n+U+JczJyuoNKtdP0sJ3e4p66VVTVh71P2Gt7tk1yH534LvpvVKSpHNfEBKMp5N+U\nrVkY/1M2hJWIxMYfhgNzPoCw\n-----END PRIVATE KEY-----\n",
  "client_email": "epec-bientenario@porteria-epec.iam.gserviceaccount.com"
};

// Función para cargar los datos de la hoja de cálculo
function loadSheetsData() {
  const client = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
  );

  client.authorize((err, tokens) => {
    if (err) {
      console.error(err);
      return;
    }
    const sheets = google.sheets({ version: 'v4', auth: client });
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    }, (err, res) => {
      if (err) {
        console.error('The API returned an error: ' + err);
        return;
      }
      const rows = res.data.values;
      if (rows.length) {
        processData(rows);
      } else {
        console.log('No data found.');
      }
    });
  });
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
    personElement.textContent = `${nombre}`;
    section.appendChild(personElement);

    total++;
  });

  document.getElementById('total').textContent = total;
}

// Función para actualizar el reloj
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  document.getElementById('clock').textContent = timeString;
}

// Función para actualizar la fecha
function updateDate() {
  const now = new Date();
  const dateString = now.toLocaleDateString();
  document.getElementById('date').textContent = dateString;
}

// Inicializar y actualizar periódicamente
function init() {
  loadSheetsData();
  updateClock();
  updateDate();
  setInterval(loadSheetsData, 300000); // Actualizar datos cada 5 minutos
  setInterval(updateClock, 1000); // Actualizar reloj cada segundo
  setInterval(updateDate, 60000); // Actualizar fecha cada minuto
}

// Cargar la biblioteca de Google y inicializar
gapi.load('client', init);
