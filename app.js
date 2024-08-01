<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control Ingreso Portería Bicentenario</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <style>
        /* Estilos generales */
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f0f2f5;
            color: #333;
        }
        .dashboard-container {
            padding: 20px;
            max-width: 1800px;
            margin: 0 auto;
        }
        
        /* Estilos para los paneles de información */
        .info-panel {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        .info-panel:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .info-panel h2 {
            font-size: 1.2rem;
            margin-bottom: 10px;
            color: #0066cc;
        }
        
        /* Estilos para las secciones de personal */
        .section {
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            height: calc(100% - 20px);
            transition: all 0.3s ease;
        }
        .section:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .section-header {
            padding: 15px;
            font-weight: bold;
            text-align: center;
            color: white;
            font-size: 1.1rem;
        }
        .section-content {
            padding: 15px;
            overflow-y: auto;
            max-height: calc(100vh - 250px);
        }
        
        /* Colores para los encabezados de cada sección */
        .contratistas .section-header { background-color: #ff7f50; }
        .epec-bicentenario .section-header { background-color: #3cb371; }
        .eling .section-header { background-color: #4169e1; }
        .epec-eor .section-header { background-color: #ffd700; }
        
        /* Estilos para las entradas de personal */
        .person {
            padding: 8px;
            border-bottom: 1px solid #eee;
            font-size: 0.9rem;
        }
        .person:last-child {
            border-bottom: none;
        }
        
        /* Estilos para las empresas contratistas */
        .contractor-company {
            margin-bottom: 15px;
            border-radius: 5px;
            padding: 10px;
        }
        .contractor-company h4 {
            font-size: 1rem;
            margin-bottom: 10px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 5px;
            color: #495057;
        }
        
        /* Estilos para el reloj y el clima */
        #clock {
            font-size: 2.5rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
        }
        #weather-data {
            font-size: 1.1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        /* Estilos para los días sin accidentes */
        #days-without-accidents {
            font-size: 2.5rem;
            font-weight: bold;
            color: #28a745;
        }
        
        /* Estilos adicionales */
        .badge {
            font-size: 1rem;
            padding: 5px 10px;
        }
        .weather-icon {
            font-size: 1.5rem;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- Fila superior con información general -->
        <div class="row g-3">
            <!-- Panel de Personas en Planta -->
            <div class="col-md-3">
                <div class="info-panel">
                    <h2><i class="fas fa-users"></i> Personas en Planta</h2>
                    <span id="total-personas" class="badge bg-primary">0</span>
                </div>
            </div>
            <!-- Panel de Camiones de Gasoil -->
            <div class="col-md-3">
                <div class="info-panel">
                    <h2><i class="fas fa-truck"></i> Camiones de Gasoil</h2>
                    <span id="total-camiones" class="badge bg-success">0</span>
                </div>
            </div>
            <!-- Panel de Reloj y Clima -->
            <div class="col-md-3">
                <div class="info-panel">
                    <div id="clock"></div>
                    <div id="weather-data"></div>
                </div>
            </div>
            <!-- Panel de Días sin accidentes -->
            <div class="col-md-3">
                <div class="info-panel text-center">
                    <h2>Días sin accidentes</h2>
                    <div id="days-without-accidents"></div>
                    <small id="last-accident-date"></small>
                </div>
            </div>
        </div>
        
        <!-- Fila inferior con secciones de personal -->
        <div class="row g-3 mt-2">
            <!-- Sección de Contratistas y Visitas -->
            <div class="col-md-3">
                <div class="section contratistas" id="contratistas">
                    <div class="section-header">
                        <i class="fas fa-hard-hat"></i> CONTRATISTAS Y VISITAS
                    </div>
                    <div class="section-content"></div>
                </div>
            </div>
            <!-- Sección de EPEC BICENTENARIO -->
            <div class="col-md-3">
                <div class="section epec-bicentenario" id="epec-bicentenario">
                    <div class="section-header">
                        <i class="fas fa-bolt"></i> EPEC BICENTENARIO
                    </div>
                    <div class="section-content"></div>
                </div>
            </div>
            <!-- Sección de ELING -->
            <div class="col-md-3">
                <div class="section eling" id="eling">
                    <div class="section-header">
                        <i class="fas fa-industry"></i> ELING
                    </div>
                    <div class="section-content"></div>
                </div>
            </div>
            <!-- Sección de EPEC EOR -->
            <div class="col-md-3">
                <div class="section epec-eor" id="epec-eor">
                    <div class="section-header">
                        <i class="fas fa-cogs"></i> EPEC EOR
                    </div>
                    <div class="section-content"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
