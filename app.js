// -------- ELEMENTOS --------
const type = document.getElementById("type");
const duration = document.getElementById("duration");
const date = document.getElementById("date");
const addBtn = document.getElementById("addBtn");

const historyDiv = document.getElementById("history");
const statsDiv = document.getElementById("stats");

const filter = document.getElementById("filter");
const themeToggle = document.getElementById("themeToggle");
const mainTitle = document.getElementById("mainTitle");

// -------- DATA --------
let trainings = JSON.parse(localStorage.getItem("trainings")) || [];
let chart;

// -------- THEME --------
function updateThemeIcon() {
  // Animación suave
  themeToggle.style.transition = "transform 0.5s ease, opacity 0.5s ease";
  themeToggle.style.opacity = 0;
  themeToggle.style.transform = "rotate(180deg)";

  setTimeout(() => {
    if (document.body.classList.contains("light")) {
      themeToggle.textContent = "🌙";
    } else {
      themeToggle.textContent = "☀️";
    }
    themeToggle.style.opacity = 1;
    themeToggle.style.transform = "rotate(0deg)";
  }, 300);
}

// Cargar tema guardado
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

// -------- EVENTOS --------
addBtn.addEventListener("click", () => {
  const training = { type: type.value, duration: Number(duration.value), date: date.value };
  if (!training.duration || !training.date) { alert("Completa todos los campos"); return; }
  trainings.push(training);
  saveData();
  render();
});

filter.addEventListener("change", render);

// -------- FUNCIONES --------
function saveData() { localStorage.setItem("trainings", JSON.stringify(trainings)); }

function deleteTraining(index) { trainings.splice(index,1); saveData(); render(); }

function render() {
  historyDiv.innerHTML = "";
  const selected = filter.value;
  const filtered = selected === "all" ? trainings : trainings.filter(t => t.type === selected);
  filtered.forEach((t,index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="card-info">
        <p><strong>${t.type}</strong></p>
        <p>${t.duration} min</p>
        <p>${t.date}</p>
      </div>
      <button class="delete-btn" onclick="deleteTraining(${index})">X</button>
    `;
    historyDiv.appendChild(card);
  });
  updateStats();
  updateChart();
  updateTitleColor();
}

// Estadísticas
function updateStats() {
  const total = trainings.length;
  const totalMinutes = trainings.reduce((sum, t) => sum + t.duration, 0);
  const avg = total ? (totalMinutes / total).toFixed(1) : 0;
  statsDiv.innerHTML = `<p><strong>Total:</strong> ${total}</p>
                        <p><strong>Minutos:</strong> ${totalMinutes}</p>
                        <p><strong>Promedio:</strong> ${avg} min</p>`;
  statsDiv.style.color = document.body.classList.contains("light") ? "#0f172a" : "#ffffff";
}

// Gráfico
function updateChart() {
  const types = ["Striking","BJJ","MMA"];
  const colors = ["#22c55e","#3b82f6","#f59e0b"];
  const data = types.map(t=>trainings.filter(tr=>tr.type===t).reduce((sum,tr)=>sum+tr.duration,0));

  if(chart) chart.destroy();

  const ctx = document.getElementById("chart");
  const textColor = document.body.classList.contains("light") ? "#0f172a" : "#ffffff";

  chart = new Chart(ctx,{
    type:"bar",
    data:{ labels: types, datasets:[{ label:"Minutos entrenados", data, backgroundColor: colors }] },
    options:{
      responsive:true,
      plugins:{ legend:{ labels:{ color: textColor } } },
      scales:{
        x:{ ticks:{ color: textColor }, grid:{ color: textColor+"33" } },
        y:{ ticks:{ color: textColor }, grid:{ color: textColor+"33" } }
      }
    }
  });
}

// Título
function updateTitleColor() {
  mainTitle.style.color = document.body.classList.contains("light") ? "#0f172a" : "#ffffff";
}

// -------- INIT --------
render();