const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log('Mensaje del servidor:', data);

    // Actualizar el valor en la tabla sin recargar la página
    if (data.sitio === 'Toma(Des.)') {
        document.getElementById('nivel-toma-des').textContent = data.nivel;
        // Opcional: Actualizar los datos del gráfico
        niveles[sitios.indexOf(data.sitio)] = data.nivel;
        Plotly.react('myDiv', data, layout);
    }
};

ws.onclose = function () {
    console.log('Conexión cerrada');
};

ws.onerror = function (error) {
    console.error('Error en la conexión WebSocket:', error);
};