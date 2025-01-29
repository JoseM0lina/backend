const countCommentsByDay = (data) => {
  const counts = {};
  
  // Iteramos sobre las claves del objeto para acceder a las respuestas
  Object.keys(data).forEach(key => {
    const saved = data[key].saved;  // Obtener la fecha del campo 'saved'

    // Extraemos la fecha de la cadena (antes de la coma)
    const dateStr = saved.split(",")[0].trim(); // "1/12/2024"

    // Convertir la fecha al formato YYYY-MM-DD
    const [day, month, year] = dateStr.split("/").map(Number);
    const formattedDate = new Date(year, month - 1, day).toISOString().split('T')[0];  // Convertimos a "YYYY-MM-DD"

    // Contamos las respuestas por día
    if (counts[formattedDate]) {
      counts[formattedDate]++;
    } else {
      counts[formattedDate] = 1;
    }
  });

  // Convertir los datos a arrays
  const labels = Object.keys(counts);  // Los días como etiquetas
  const responseCounts = Object.values(counts);  // Las respuestas por día

  return { labels, counts: responseCounts };
};

// Función para actualizar el gráfico
const updateLineChart = () => { 
  fetch('/api/v1/landing') // Asegúrate de que esta API devuelve datos de Firebase
    .then(response => response.json())
    .then(data => {
      console.log(data); // Verifica qué datos se reciben

      // Verifica que data sea un objeto
      if (typeof data !== 'object') {
        console.error("La respuesta no es un objeto. Datos recibidos:", data);
        return;
      }

      let { labels, counts } = countCommentsByDay(data);

      if (labels.length === 0 || counts.length === 0) {
        console.warn("No se encontraron datos para el gráfico.");
        return;
      }

      // Actualizar datos del gráfico
      window.myLine.data.labels = labels;
      window.myLine.data.datasets[0].data = counts;

      window.myLine.update();
    })
    .catch(error => console.error('Error al obtener datos:', error));
};

// Función para convertir la fecha del formato "1/12/2024, 9:47:38 p. m." a un formato estándar Date
function convertToDate(dateStr) {
  const months = {
    "ene": 0, "feb": 1, "mar": 2, "abr": 3, "may": 4, "jun": 5,
    "jul": 6, "ago": 7, "sep": 8, "oct": 9, "nov": 10, "dic": 11
  };

  // Usa una expresión regular para extraer la fecha y hora del formato "1/12/2024, 9:47:38 p. m."
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),\s(\d{1,2}):(\d{2}):(\d{2})\s([ap])\.m\./);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // Restamos 1 porque los meses en JS empiezan desde 0
  const year = parseInt(match[3], 10);
  let hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const second = parseInt(match[6], 10);
  const period = match[7]; // "a" o "p" para AM/PM

  // Convertir la hora en formato 24 horas si es necesario
  if (period === 'p' && hour < 12) {
    hour += 12; // Convertir PM a formato 24 horas
  } else if (period === 'a' && hour === 12) {
    hour = 0; // Convertir 12 AM a 00:00
  }

  // Crear la fecha en formato Date estándar
  return new Date(year, month, day, hour, minute, second);
}

// Configuración del gráfico de líneas
const lineConfig = {
  type: 'line',
  data: {
    labels: [], // Las fechas serán los labels
    datasets: [
      {
        label: 'Respuestas por día',
        backgroundColor: '#0694a2',
        borderColor: '#0694a2',
        data: [], // Datos con las respuestas por día
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Día' },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        display: true,
        title: { display: true, text: 'Cantidad de respuestas' },
        beginAtZero: true,
      },
    },
  },
};

// Inicializar el gráfico
const lineCtx = document.getElementById('line');
window.myLine = new Chart(lineCtx, lineConfig);

// Cargar los datos dinámicamente
updateLineChart();