const taulesContainer = document.getElementById("taules-checkboxes");
const btnPractica = document.getElementById("btnPractica");
const btnExamen = document.getElementById("btnExamen");
const btnVerifica = document.getElementById("btnVerifica");
const operacionsContainer = document.getElementById("operacions");
const cronometreDisplay = document.getElementById("cronometre");
const historialContainer = document.getElementById("historial");
const toggleHistorial = document.getElementById("toggleHistorial");

let mode = "";
let cronometre = 0;
let cronometreInterval = null;
let operacions = [];

function crearCheckboxesTaules() {
  for (let i = 1; i <= 10; i++) {
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = i;
    cb.checked = true;
    taulesContainer.appendChild(cb);
    taulesContainer.appendChild(document.createTextNode(" " + i + " "));
  }
}

function iniciarCronometre() {
  cronometre = 0;
  cronometreDisplay.textContent = "⏱️ 0s";
  cronometreInterval = setInterval(() => {
    cronometre++;
    cronometreDisplay.textContent = `⏱️ ${cronometre}s`;
  }, 1000);
}

function pararCronometre() {
  clearInterval(cronometreInterval);
}

function generarOperacions() {
  pararCronometre();
  operacionsContainer.innerHTML = "";
  operacions = [];

  const taules = Array.from(taulesContainer.querySelectorAll("input:checked")).map(cb => parseInt(cb.value));
  let numOps = parseInt(document.getElementById("numOps").value);

  // Generar todas las combinaciones posibles sin repetir
  let combinacions = [];

  // Añadir una sola multiplicación por 1 (si hay tablas seleccionadas)
  if (taules.length > 0) {
    const a = taules[Math.floor(Math.random() * taules.length)];
    combinacions.push([a, 1]);
  }

  // Añadir el resto (b = 2..10)
  taules.forEach(a => {
    for (let b = 2; b <= 10; b++) {
      combinacions.push([a, b]);
    }
  });

  // Mezclar combinaciones
  combinacions = combinacions.sort(() => Math.random() - 0.5);

  // Ajustar número de operaciones si excede el máximo posible
  if (numOps > combinacions.length) {
    numOps = combinacions.length;
  }

  // Tomar las primeras numOps combinaciones
  const seleccionadas = combinacions.slice(0, numOps);

  // Crear las operaciones
  seleccionadas.forEach(([a, b]) => {
  
    const div = document.createElement("div");
    div.className = "operacio";
	
	if (mode === "examen")
	{   
		div.innerHTML = `${a} × ${b} = <input type="number" data-resposta="${a * b}" />
		<span class="resultat"></span>`;
	}else
	{
		div.innerHTML = `${a} × ${b} = <input type="number" data-resposta="${a * b}" />
		<button class="btn btn-probeta">🧪</button>
		<span class="resultat"></span>`;
	}

    operacionsContainer.appendChild(div);
    operacions.push({ a, b, resposta: a * b, input: div.querySelector("input"), resultat: div.querySelector(".resultat"), verificada: false });
  });

  btnVerifica.disabled = true;
  cronometreDisplay.textContent = "⏱️ 0s";
  if (mode === "examen" || mode === "practica") iniciarCronometre();
}

function verificarIndividual(e) {
  const div = e.target.closest(".operacio");
  const input = div.querySelector("input");
  const resultat = div.querySelector(".resultat");
  const correcte = parseInt(input.value) === parseInt(input.dataset.resposta);
  resultat.textContent = correcte ? "✅" : "❌";
}

function verificarGlobal() {
  pararCronometre();
  let correctes = 0;
  operacions.forEach(op => {
    const val = parseInt(op.input.value);
    const correcte = val === op.resposta;
    op.resultat.textContent = correcte ? "✅" : "❌";
    if (correcte) correctes++;
  });
  const percentatge = Math.round((correctes / operacions.length) * 100);
  const estrelles = "★".repeat(Math.round(percentatge / 10)) + "☆".repeat(10 - Math.round(percentatge / 10));
  const taules = Array.from(taulesContainer.querySelectorAll("input:checked")).map(cb => cb.value).join(", ");
  const missatge = obtenirMissatge(percentatge);
  const entry = document.createElement("div");
  entry.className = `historial-entry ${mode}`;
  entry.innerHTML = `<div>${new Date().toLocaleString()} | <span class="stars">${estrelles}</span> | ${cronometre}s | Taules: ${taules} <button class="btn btn-probeta">🗑️</button></div><div>💬 ${missatge}</div>`;
  historialContainer.appendChild(entry);
  ordenarHistorial();
  guardarHistorialLocal();
  btnVerifica.disabled = true;
}

function obtenirMissatge(percentatge) {
  const missatges = {
    0: ["No passa res! 💪 Torna-ho a intentar!", "Cada error és una oportunitat! 🌱", "Ho faràs millor la pròxima! 🐢"],
    20: ["Estàs començant! 📘", "Segueix practicant! 🧠", "No et rendeixis! 💡"],
    40: ["Millora a la vista! 🔍", "Bon intent! 🛠️", "Estàs aprenent! 📚"],
    60: ["Bon progrés! 👏", "Ja ho tens a tocar! 👐", "Multiplicacions quasi perfectes! 🧮"],
    80: ["Fantàstic! 🌟 Quina millora!", "Excel·lent! 🥳 Has superat el repte!", "Multiplicacions 10/10! 🌈"],
    100: ["Multiplicacions impecables! 🏅", "Perfecte! 💯 No hi ha qui t’aturi!", "Ets un crack de les taules! 🚀"]
  };
  if (percentatge === 100) return missatges[100][Math.floor(Math.random() * 3)];
  if (percentatge >= 81) return missatges[80][Math.floor(Math.random() * 3)];
  if (percentatge >= 61) return missatges[60][Math.floor(Math.random() * 3)];
  if (percentatge >= 41) return missatges[40][Math.floor(Math.random() * 3)];
  if (percentatge >= 21) return missatges[20][Math.floor(Math.random() * 3)];
  return missatges[0][Math.floor(Math.random() * 3)];
}


function toggleHistorialView() {
  const historial = document.getElementById('historial');
  if (historial.style.display === 'none') {
    historial.style.display = 'block'; // Mostrar historial
  } else {
    historial.style.display = 'none';  // Ocultar historial
  }
}


function eliminarEntrada(e) {
  const entry = e.target.closest(".historial-entry");
  if (entry) {
    entry.remove();
    guardarHistorialLocal();
  }
  }

function verificarDisponibilitat() {
  const totRespost = operacions.every(op => op.input.value !== "");
  btnVerifica.disabled = !totRespost;
}

btnPractica.addEventListener("click", () => {
  mode = "practica";
  generarOperacions();
});

btnExamen.addEventListener("click", () => {
  mode = "examen";
  generarOperacions();
});

btnVerifica.addEventListener("click", verificarGlobal);

toggleHistorial.addEventListener("click", toggleHistorialView);

operacionsContainer.addEventListener("click", e => {
  if (e.target.classList.contains("btn-probeta")) verificarIndividual(e);
});

operacionsContainer.addEventListener("input", verificarDisponibilitat);
historialContainer.addEventListener("click", e => {
  if (e.target.textContent === "🗑️") eliminarEntrada(e);
});

crearCheckboxesTaules();
cargarHistorialLocal();

function guardarHistorialLocal() {
  localStorage.setItem('historialMultiplicar', historialContainer.innerHTML);
}

function cargarHistorialLocal() {
  const data = localStorage.getItem('historialMultiplicar');
  if (data) {
    historialContainer.innerHTML = data;
  }
}


function ordenarHistorial() {
  const entries = Array.from(document.querySelectorAll('.historial-entry'));

  entries.sort((a, b) => {
    // 1. Examen primero
    const modeA = a.classList.contains('examen') ? 0 : 1;
    const modeB = b.classList.contains('examen') ? 0 : 1;
    if (modeA !== modeB) return modeA - modeB;

    // 2. Porcentaje (data-percent)
    const percentA = parseInt(a.dataset.percent);
    const percentB = parseInt(b.dataset.percent);
    if (percentA !== percentB) return percentB - percentA;

    // 3. Tiempo (data-time)
    const timeA = parseInt(a.dataset.time);
    const timeB = parseInt(b.dataset.time);
    if (timeA !== timeB) return timeA - timeB;

  });

  const historialContainer = document.getElementById('historial');
  historialContainer.innerHTML = '';
  entries.forEach(entry => historialContainer.appendChild(entry));
}
