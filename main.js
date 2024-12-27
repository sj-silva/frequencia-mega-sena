let frequencies = Array(60).fill(0);
let currentChart = null; // Global variable to store the current chart instance

async function getDatabase() {
  try {
    // Define the path to the JSON file in the 'database' folder
    const dataPath =
      "https://sj-silva.github.io/mega-sena-consulta/database/lottery-results.json";

    // Fetch the file
    const response = await fetch(dataPath);

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch database: ${response.statusText}`);
    }
    // Parse and return the JSON content
    return await response.json();
  } catch (error) {
    console.error("Error fetching the database file:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}

async function calculateFrequencies(filter = "historical") {
  frequencies = Array(60).fill(0); // Reset frequencies
  const data = await getDatabase();

  let filteredResults = data.allResults;

  // Apply filters (unchanged logic)
  const currentYear = new Date().getFullYear();
  switch (filter) {
    case "last100":
      filteredResults = filteredResults.slice(-100);
      break;
    case "last50":
      filteredResults = filteredResults.slice(-50);
      break;
    case "last10":
      filteredResults = filteredResults.slice(-10);
      break;
    case "currentYear":
      filteredResults = filteredResults.slice(-104);
      break;
    case "last3Years":
      // 3 anos: 312 sorteios
      filteredResults = filteredResults.slice(-312);
      break;
    case "last5Years":
      // 5 anos: 520 sorteios
      filteredResults = filteredResults.slice(-520);
      break;
    case "last10Years":
      // 10 anos: 1040 sorteios
      filteredResults = filteredResults.slice(-1040);
      break;
    default:
      break;
  }

  // Update frequencies (unchanged logic)
  filteredResults.forEach((result) => {
    [
      result.Bola1,
      result.Bola2,
      result.Bola3,
      result.Bola4,
      result.Bola5,
      result.Bola6,
    ].forEach((number) => {
      frequencies[number - 1]++; // Increment frequency count
    });
  });

  // Update UI after calculating frequencies
  updateHeadings(filter);
  displayFrequencies();
  displayFrequencyChart(filter); // Only display; no recalculation here
}

function updateHeadings(filter) {
  const tableHeading = document.querySelector("#frequency-table-section h2");
  const chartHeading = document.querySelector("#frequency-chart-section h2");

  const filterTextMap = {
    historical: "Histórico Completo",
    last100: "Últimos 100 Sorteios",
    last50: "Últimos 50 Sorteios",
    last10: "Últimos 10 Sorteios",
    currentYear: "104 Sorteios",
    last3Years: "312 Sorteios",
    last5Years: "520 Sorteios",
    last10Years: "1040 Sorteios",
  };

  const filterText = filterTextMap[filter] || "Histórico Completo";

  tableHeading.textContent = `Frequência dos Números (${filterText})`;
  chartHeading.textContent = `Gráfico de Frequência (${filterText})`;
}

function displayFrequencies() {
  const tableBody = document.getElementById("matchesTableBody");
  tableBody.innerHTML = ""; // Clear existing rows

  // Combine numbers with frequencies and sort by frequency
  const frequencyData = frequencies.map((frequency, index) => ({
    number: index + 1,
    frequency: frequency,
  }));

  frequencyData.sort((a, b) => b.frequency - a.frequency); // descending order

  frequencyData.forEach((data, index) => {
    const row = document.createElement("tr");

    // Adicionando a posição (index + 1, pois começa do 1)
    row.innerHTML = `
      <td>${index + 1}º</td> <!-- Posição -->
      <td>${data.number}</td>
      <td>${data.frequency}</td>
    `;
    tableBody.appendChild(row);
  });
}

async function displayFrequencyChart(filter) {
  const ctx = document.getElementById("frequencyChart").getContext("2d");
  const filterTextMap = {
    historical: "Histórico Completo",
    last100: "Últimos 100 Sorteios",
    last50: "Últimos 50 Sorteios",
    last10: "Últimos 10 Sorteios",
    currentYear: "Ano Corrente",
    last3Years: "Últimos 3 Anos",
    last5Years: "Últimos 5 Anos",
    last10Years: "Últimos 10 Anos",
  };
  const filterText = filterTextMap[filter] || "Histórico Completo";

  // Destroy the existing chart if it exists
  if (currentChart) {
    currentChart.destroy();
  }

  // Create a new chart instance and assign it to the global variable
  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Array.from({ length: 60 }, (_, i) => i + 1), // Keep numerical order
      datasets: [
        {
          label: `Frequência de Números (${filterText})`,
          data: frequencies, // Use precomputed frequencies
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Event listener for filter buttons
document
  .getElementById("filter-menu-section")
  .addEventListener("click", async (event) => {
    const button = event.target.closest(".filter-button");
    if (button) {
      const filter = button.dataset.filter;

      // Ensure frequencies are updated before rendering
      await calculateFrequencies(filter);
    }
  });

calculateFrequencies();
