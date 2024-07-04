const fs = require('fs');

// Función para preparar el contenido a escribir
function lecturaExitosa(headers, firstWords, secondColumnData) {

    const nivelRebalse = [4, 3, 3, 5, 5, 4, 3, 5, 3.8, 4]
   
    let complementoNivel = [];

// Calcular los valores para complementoNivel
for (let i = 0; i < nivelRebalse.length; i++) {
  complementoNivel[i] = nivelRebalse[i] - secondColumnData[i];
}

    // Construye el contenido usando template literals
    console.log(`
        _______oBBBBB8o______oBBBBBBB
        _____o8BBBBBBBBBBB__BBBBBBBBB8________o88o,
        ___o8BBBBBB**8BBBB__BBBBBBBBBB_____oBBBBBBBo,
        __oBBBBBBB*___***___BBBBBBBBBB_____BBBBBBBBBBo,
        _8BBBBBBBBBBooooo___*BBBBBBB8______*BB*_8BBBBBBo,
        _8BBBBBBBBBBBBBBBB8ooBBBBBBB8___________8BBBBBBB8,
        __*BBBBBBBBBBBBBBBBBBBBBBBBBB8_o88BB88BBBBBBBBBBBB,
        ____*BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB8,
        ______**8BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB*,
        ___________*BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB8*,
        ____________*BBBBBBBBBBBBBBBBBBBBBBBB8888**,
        _____________BBBBBBBBBBBBBBBBBBBBBBB*,
        _____________*BBBBBBBBBBBBBBBBBBBBB*,
        ______________*BBBBBBBBBBBBBBBBBB8,
        _______________*BBBBBBBBBBBBBBBB*,
        ________________8BBBBBBBBBBBBBBB8,
        _________________8BBBBBBBBBBBBBBBo
        `)


        let contenido = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabla de Datos y Gráfico</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        table {
            width: auto;
            margin: 20px auto;
            border-collapse: collapse;
            border: 1px solid #ccc;
        }
        th, td {
            padding: 8px;
            text-align: center;
            border: 1px solid #ccc;
        }
        th {
            background-color: #f2f2f2;
            color: #333;
            text-transform: uppercase;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
    </style>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <h1>Datos de Nivel, Cloro y Turbiedad</h1>
    <div name="marco">
        <table>
            <thead>
                <tr>
                    <th>Sitio</th>
                    <th>${headers[0]}</th>
                    <th>${headers[1]}</th>
                    <th>${headers[2]}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${firstWords[0]}</td>
                    <td>${secondColumnData[0]}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>${firstWords[1]}</td>
                    <td>${secondColumnData[1]}</td>
                    <td></td>
                    <td>10.63</td>
                </tr>
                <tr>
                    <td>${firstWords[2]}</td>
                    <td>${secondColumnData[2]}</td>
                    <td>1.28</td>
                    <td>0.13</td>
                </tr>
                <tr>
                    <td>${firstWords[3]}</td>
                    <td>${secondColumnData[3]}</td>
                    <td>1.22</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${firstWords[4]}</td>
                    <td>${secondColumnData[4]}</td>
                    <td>0.69</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${firstWords[5]}</td>
                    <td>${secondColumnData[5]}</td>
                    <td>0.56</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${firstWords[6]}</td>
                    <td>${secondColumnData[6]}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>${firstWords[7]}</td>
                    <td>${secondColumnData[7]}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>${firstWords[8]}</td>
                    <td>${secondColumnData[8]}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>${firstWords[9]}</td>
                    <td>${secondColumnData[9]}</td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Div donde se renderizará el gráfico -->
    <div id="myDiv" style="width: 100%; height: 500px;"></div>

    <script>
        // Datos de la tabla
        var sitios = ['${firstWords[0]}', '${firstWords[1]}', '${firstWords[2]}', '${firstWords[3]}', '${firstWords[4]}', '${firstWords[5]}', '${firstWords[6]}', '${firstWords[7]}', '${firstWords[8]}', '${firstWords[9]}'];
        var niveles = [${secondColumnData[0]}, ${secondColumnData[1]}, ${secondColumnData[2]}, ${secondColumnData[3]}, ${secondColumnData[4]}, ${secondColumnData[5]}, ${secondColumnData[6]}, ${secondColumnData[7]}, ${secondColumnData[8]}, ${secondColumnData[9]}];

        var trace1 = {
            x: sitios,
            y: niveles,
            name: 'Nivel',
            type: 'bar',
            marker: {
                color: '#2E3A8B',
            }
        };

        var trace2 = {
            x: sitios,
            y: [${complementoNivel[0]}, ${complementoNivel[1]}, ${complementoNivel[2]}, ${complementoNivel[3]}, ${complementoNivel[4]}, ${complementoNivel[5]}, ${complementoNivel[6]}, ${complementoNivel[7]}, ${complementoNivel[8]}, ${complementoNivel[9]}],
            name: 'Rebalse',
            type: 'bar',
            marker: {
                color: '#2E3A8B',
                opacity: 0.3
            }
        };

        var data = [trace1, trace2];

        // Configurar el diseño del gráfico
        var layout = {
            barmode: 'stack',
            title: 'Niveles de Agua por Sitio',
            xaxis: {
                title: 'Sitio'
            },
            yaxis: {
                title: 'Nivel [m]'
            }
        };

        // Renderizar el gráfico en el div con id 'myDiv'
        Plotly.newPlot('myDiv', data, layout);
    </script>
</body>
</html>

        `
      

    // Ruta y nombre del archivo
    const rutaArchivo = "public/index.html";

    // Escribir en el archivo
    fs.writeFile(rutaArchivo, contenido, (err) => {
        if (err) {
            console.error('Error al escribir archivo:', err);
            return;
        }
        console.log('Archivo escrito correctamente.');
    });
}


// Exportar la función si es necesario
module.exports = {
    lecturaExitosa
};


