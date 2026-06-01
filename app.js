// -------- ELEMENTOS --------
const type = document.getElementById("type");
const duration = document.getElementById("duration");
const date = document.getElementById("date");
const addBtn = document.getElementById("addBtn");

const historyDiv = document.getElementById("history");
const filter = document.getElementById("filter");
const themeToggle = document.getElementById("themeToggle");
const mainTitle = document.getElementById("mainTitle");

// stats
const statTotal = document.querySelector("#statTotal .stat-number");
const statMinutes = document.querySelector("#statMinutes .stat-number");
const statAvg = document.querySelector("#statAvg .stat-number");
const statStreak = document.querySelector("#statStreak .stat-number");

// header sesiones
const headerTotal = document.getElementById("headerTotal");

// disciplina mins
const disciplineIds = ["Striking", "BJJ", "MMA", "Wrestling", "Cardio"];

// chart buttons
const barBtn = document.getElementById("barBtn");
const lineBtn = document.getElementById("lineBtn");

// intensity
const intensityBtns = document.querySelectorAll(".intensity-btn");

// -------- DATA --------
let trainings = JSON.parse(localStorage.getItem("trainings")) || [];
let chart;
let chartType = "bar";
let intensity = 1;

// -------- INTENSITY --------
intensityBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    intensityBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    intensity = Number(btn.dataset.level);
  });
});

// -------- CHART TYPE --------
barBtn.addEventListener("click", () => {
  chartType = "bar";
  barBtn.classList.add("active");
  lineBtn.classList.remove("active");
  updateChart();
});

lineBtn.addEventListener("click", () => {
  chartType = "line";
  lineBtn.classList.add("active");
  barBtn.classList.remove("active");
  updateChart();
});

// -------- THEME --------
function updateThemeIcon() {
  themeToggle.style.transition = "transform 0.5s ease, opacity 0.5s ease";
  themeToggle.style.opacity = 0;
  themeToggle.style.transform = "rotate(180deg)";

  setTimeout(() => {
    themeToggle.innerHTML = document.body.classList.contains("light")
      ? "🌙"
      : "☀️";

    themeToggle.style.opacity = 1;
    themeToggle.style.transform = "rotate(0deg)";
  }, 300);
}

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}
updateThemeIcon();

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const theme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", theme);

  updateChart();
  updateTitleColor();
  updateThemeIcon();
});

// -------- ADD SESSION --------
addBtn.addEventListener("click", () => {
  const training = {
    type: type.value,
    duration: Number(duration.value),
    date: date.value,
    intensity: intensity
  };

  if (!training.duration || !training.date) {
    alert("Completa todos los campos");
    return;
  }

  trainings.push(training);
  saveData();
  render();
});

// -------- FILTER --------
filter.addEventListener("change", render);

// -------- SAVE --------
function saveData() {
  localStorage.setItem("trainings", JSON.stringify(trainings));
}

// -------- DELETE --------
function deleteTraining(realIndex) {
  trainings.splice(realIndex, 1);
  saveData();
  render();
}

// -------- RENDER --------
function render() {
  historyDiv.innerHTML = "";

  const selected = filter.value;

  const filtered =
    selected === "all"
      ? trainings
      : trainings.filter(t => t.type === selected);

  filtered.forEach((t) => {
    const realIndex = trainings.indexOf(t);

    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-type", t.type);

    card.innerHTML = `
      <div class="card-info">
        <div class="card-type">${t.type}</div>
        <div class="card-meta">
          <span>${t.date}</span>
          <span>${t.duration} min</span>
          <span>🔥 ${t.intensity || 1}</span>
        </div>
      </div>

      <div class="card-duration">${t.duration}</div>

      <button class="delete-btn" onclick="deleteTraining(${realIndex})">✕</button>
    `;

    historyDiv.appendChild(card);
  });

  updateStats();
  updateDisciplineMinutes();
  updateChart();
  updateTitleColor();
}

// -------- STATS --------
function updateStats() {
  const total = trainings.length;
  const totalMinutes = trainings.reduce((sum, t) => sum + t.duration, 0);
  const avg = total ? (totalMinutes / total).toFixed(1) : 0;

  statTotal.textContent = total;
  statMinutes.textContent = totalMinutes;
  statAvg.textContent = avg;

  headerTotal.textContent = total;

  statStreak.textContent = calculateStreak();
}

// -------- DISCIPLINE MINUTES --------
function updateDisciplineMinutes() {
  disciplineIds.forEach(type => {
    const total = trainings
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.duration, 0);

    const el = document.getElementById("min-" + type);
    if (el) el.textContent = total + " min";
  });
}

// -------- STREAK --------
function calculateStreak() {
  if (trainings.length === 0) return 0;

  const dates = trainings
    .map(t => new Date(t.date))
    .sort((a, b) => b - a);

  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);

    if (diff === 1) streak++;
    else break;
  }

  return streak;
}

// -------- CHART --------
function updateChart() {
  const types = ["Striking", "BJJ", "MMA", "Wrestling", "Cardio"];

  const colors = [
    "#E63946",
    "#3B82F6",
    "#F59E0B",
    "#A855F7",
    "#10B981"
  ];

  const data = types.map(t =>
    trainings
      .filter(tr => tr.type === t)
      .reduce((sum, tr) => sum + tr.duration, 0)
  );

  if (chart) chart.destroy();

  const ctx = document.getElementById("chart");

  const textColor = document.body.classList.contains("light")
    ? "#0f172a"
    : "#ffffff";

  chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: types,
      datasets: [{
        label: "Minutos entrenados",
        data,
        backgroundColor: colors,
        borderColor: colors,
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: textColor + "33" }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: textColor + "33" }
        }
      }
    }
  });
}

// -------- TITLE --------
function updateTitleColor() {
  mainTitle.style.color = document.body.classList.contains("light")
    ? "#0f172a"
    : "#ffffff";
}

// -------- INIT --------
render();
