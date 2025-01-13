/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
const pieConfig = {
  type: 'doughnut',
  data: {
    datasets: [
      {
        data: [33, 33, 33],
        /**
         * These colors come from Tailwind CSS palette
         * https://tailwindcss.com/docs/customizing-colors/#default-color-palette
         */
        backgroundColor: ['#0694a2', '#1c64f2', '#7e3af2'],
        label: 'Dataset 1',
      },
    ],
    labels: ['Shoes', 'Shirts', 'Bags'],
  },
  options: {
    responsive: true,
    cutoutPercentage: 80,
    /**
     * Default legends are ugly and impossible to style.
     * See examples in charts.html to add your own legends
     *  */
    legend: {
      display: false,
    },
  },
}

// change this to the id of your chart element in HMTL
const pieCtx = document.getElementById('pie')
window.myPie = new Chart(pieCtx, pieConfig)

// Función para procesar el JSON
countCommentsByHour = (data) => {

  // Inicializar contadores por rango de horas
  const labels = ["0 a.m. - 8 a.m.", "8 a.m. - 16 p.m.", "16 p.m. - 0 a.m."];
  const counts = [0, 0, 0];

  Object.values(data).forEach(record => {

    const savedTime = record.saved;
    if (!savedTime) {
      return;
    }

    // Convertir a formato de hora AM/PM
    const formattedTime = savedTime.replace('a. m.', 'AM').replace('p. m.', 'PM');
         
    // Crear objeto Date con la cadena de tiempo
    const dt = new Date(Date.parse(formattedTime.replace(/(\d{2}\/\d{2}\/\d{4}), (\d{2}):(\d{2}):(\d{2}) (AM|PM)/, '$1 $2:$3:$4 $5')));
    const hour = dt.getHours();

    // Clasificar en el rango correspondiente
    if (hour >= 0 && hour < 8) {
      counts[0]++;
    } else if (hour >= 8 && hour < 16) {
      counts[1]++;
    } else {
      counts[2]++;
    }
  });
 
  return { labels, counts };
}

update = () => {
  fetch('/api/v1/landing')
    .then(response => response.json())
    .then(data => {

    let { labels, counts } = countCommentsByHour(data)

    // Reset data
    window.myPie.data.labels = [];
    window.myPie.data.datasets[0].data = [];

    // New data
    window.myPie.data.labels = [...labels]
    window.myPie.data.datasets[0].data = [...counts]

    window.myPie.update();
  })
  .catch(error => console.error('Error:', error));
}

update();