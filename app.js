// Segurança
if (!localStorage.getItem('gympro_user')) {
    window.location.href = 'login.html';
}

const loggedUser = JSON.parse(localStorage.getItem('gympro_user') || '{}');
const API = 'https://academax-backend.onrender.com/api';

// Variáveis globais
let targetUserIdForWorkout = null;
let globalClients = [];
let DB = { workouts: [], history: [] };

// Carrega treinos e histórico do banco de dados real
async function loadDB() {
    try {
        const resWorkouts = await fetch(`${API}/workouts/${loggedUser.id}`);
        DB.workouts = await resWorkouts.json();
        
        const resHistory = await fetch(`${API}/history/${loggedUser.id}`);
        DB.history = await resHistory.json();
        
        renderDashboard();
        renderWorkouts();
        renderHistory();
    } catch (error) {
        console.error("Erro ao carregar banco de dados:", error);
    }
}

const exerciseLibrary = [
    { name: "Supino Reto", muscle: "Peito", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80", video: "rT7DgCr-3pg" },
    { name: "Supino Inclinado", muscle: "Peito", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80", video: "8iPEnn-ltC8" },
    { name: "Crucifixo", muscle: "Peito", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=200&q=80", video: "e7XVB3pXyIQ" },
    { name: "Crossover", muscle: "Peito", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=200&q=80", video: "I5i1b5J4fPw" },
    { name: "Flexão de Braço", muscle: "Peito", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2dcb?auto=format&fit=crop&w=200&q=80", video: "IODKqqHjHnI" },
    { name: "Puxada Frontal", muscle: "Costas", img: "https://images.unsplash.com/photo-1517960451124-7d9b3f0a8f0b?auto=format&fit=crop&w=200&q=80", video: "CAo7hKvxeXQ" },
    { name: "Remada Curvada", muscle: "Costas", img: "https://images.unsplash.com/photo-1583500178690-f7f4aca4d0b1?auto=format&fit=crop&w=200&q=80", video: "kBji6j5XNQ4" },
    { name: "Remada Baixa", muscle: "Costas", img: "https://images.unsplash.com/photo-1597347306199-68b3a8d1c9e1?auto=format&fit=crop&w=200&q=80", video: "pApl4TKy1UM" },
    { name: "Levantamento Terra", muscle: "Costas", img: "https://images.unsplash.com/photo-1584466977773-e625c64c8d3b?auto=format&fit=crop&w=200&q=80", video: "Nyju6b1Z3UE" },
    { name: "Agachamento", muscle: "Pernas", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=200&q=80", video: "ultWZbUMPL8" },
    { name: "Leg Press", muscle: "Pernas", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80", video: "IZQ0Q1N_NtU" },
    { name: "Cadeira Extensora", muscle: "Pernas", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80", video: "t3D1F4q6p9w" },
    { name: "Panturrilha", muscle: "Pernas", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=200&q=80", video: "3b5d1w5p2Q8" },
    { name: "Rosca Direta", muscle: "Bíceps", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=200&q=80", video: "kwG2ipFRgfo" },
    { name: "Rosca Martelo", muscle: "Bíceps", img: "https://images.unsplash.com/photo-1583500178690-f7f4aca4d0b1?auto=format&fit=crop&w=200&q=80", video: "z4eR3Nk5L6o" },
    { name: "Tríceps Pulley", muscle: "Tríceps", img: "https://images.unsplash.com/photo-1597347306199-68b3a8d1c9e1?auto=format&fit=crop&w=200&q=80", video: "2j5j3w4Q5e" },
    { name: "Tríceps Testa", muscle: "Tríceps", img: "https://images.unsplash.com/photo-1584466977773-e625c64c8d3b?auto=format&fit=crop&w=200&q=80", video: "5l3qJ4N8wQ" },
    { name: "Desenvolvimento", muscle: "Ombro", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=200&q=80", video: "q4eR3Nk5L6" },
    { name: "Elevação Lateral", muscle: "Ombro", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=200&q=80", video: "3d1w5p2Q8c" },
    { name: "Abdominal Supra", muscle: "Abdômen", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2dcb?auto=format&fit=crop&w=200&q=80", video: "IODKqqHjHnI" },
    { name: "Prancha", muscle: "Abdômen", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80", video: "ASdvN98wQ" }
];

function navigateTo(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(`view-${viewName}`).classList.add('active-view');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (typeof event !== 'undefined' && event && event.target && event.target.classList.contains('nav-btn')) {
        event.target.classList.add('active');
    } else if (typeof event !== 'undefined' && event && event.target.closest('.nav-btn')) {
        event.target.closest('.nav-btn').classList.add('active');
    }
    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'workouts') renderWorkouts();
    if (viewName === 'history') renderHistory();
    if (viewName === 'progression') renderProgression();
    if (viewName === 'clients') renderClients();
    if (viewName === 'profile') loadProfileData();
}

function renderDashboard() {
    document.getElementById('today-workout').innerText = DB.workouts.length > 0 ? `${DB.workouts[0].name} - ${DB.workouts[0].desc}` : "Nenhum treino criado";
    document.getElementById('total-workouts').innerText = DB.history.length;
    let totalVol = 0; DB.history.forEach(s => totalVol += s.volume);
    document.getElementById('total-volume').innerText = totalVol.toFixed(1);
    const resumeBtn = document.getElementById('resume-btn');
    if (activeWorkout && activeExerciseIndex < flatSets.length) { resumeBtn.style.display = 'flex'; } else { resumeBtn.style.display = 'none'; }
    initWeightChart();
}

let weightChart = null;
function initWeightChart() {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return; 
    const context = ctx.getContext('2d');
    if (weightChart) weightChart.destroy();
    weightChart = new Chart(context, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'],
            datasets: [{ label: 'Peso (kg)', data: [75, 74.5, 74.2, 73.8, 73.5], borderColor: '#b5c7eb', backgroundColor: 'rgba(181, 199, 235, 0.1)', borderWidth: 3, fill: true, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6e76' } }, x: { grid: { display: false }, ticks: { color: '#6b6e76' } } } }
    });
}

function renderWorkouts() {
    const list = document.getElementById('workouts-list');
    list.innerHTML = DB.workouts.length === 0 ? "<p class='subtitle'>Nenhum treino criado.</p>" : "";
    DB.workouts.forEach(w => {
        list.innerHTML += `<div class="workout-item"><div class="workout-info"><h3>${w.name}</h3><p>${w.desc} - ${w.exercises.length} exercícios</p></div><div class="workout-actions"><button class="btn-action btn-edit" onclick="editWorkout('${w.id}')"><i class="fa-solid fa-pen-to-square"></i> Editar</button><button class="btn-action btn-delete" onclick="deleteWorkout('${w.id}')"><i class="fa-solid fa-trash-can"></i> Excluir</button><button class="btn-action btn-start" onclick="startWorkout('${w.id}')"><i class="fa-solid fa-play"></i> Iniciar</button></div></div>`;
    });
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = DB.history.length === 0 ? "<p class='subtitle'>Nenhum treino realizado.</p>" : "";
    DB.history.slice().reverse().forEach(h => {
        list.innerHTML += `<div class="workout-item"><div class="workout-info"><h3>${h.workoutName}</h3><p>${new Date(h.date).toLocaleDateString('pt-BR')} | Volume: ${h.volume.toFixed(1)} kg</p></div></div>`;
    });
}

function openVideo(name) { window.open(`https://www.youtube.com/results?search_query=Como+fazer+${encodeURIComponent(name)}`, '_blank'); }

let tempExercisesToAdd = []; let editingWorkoutId = null; let currentMuscleTab = "Peito";

function openCreateWorkoutModal() {
    editingWorkoutId = null; tempExercisesToAdd = [];
    document.getElementById('new-workout-name').value = ""; document.getElementById('new-workout-desc').value = "";
    document.getElementById('form-modal-title').innerText = "Criar Novo Treino";
    document.getElementById('save-workout-btn').innerText = "Salvar Treino";
    document.getElementById('create-workout-modal').classList.remove('hidden');
    renderAddedExercises(); renderLibrary();
}

function editWorkout(id) {
    const workout = DB.workouts.find(w => w.id === id); if (!workout) return;
    editingWorkoutId = id; tempExercisesToAdd = JSON.parse(JSON.stringify(workout.exercises));
    document.getElementById('new-workout-name').value = workout.name; document.getElementById('new-workout-desc').value = workout.desc;
    document.getElementById('form-modal-title').innerText = "Editar Treino"; document.getElementById('save-workout-btn').innerText = "Atualizar Treino";
    document.getElementById('create-workout-modal').classList.remove('hidden'); renderAddedExercises(); renderLibrary();
}

async function deleteWorkout(id) { if (confirm("Excluir este treino?")) { DB.workouts = DB.workouts.filter(w => w.id !== id); renderWorkouts(); } }

function renderLibrary() {
    const tabsDiv = document.getElementById('exercises-tabs');
    const muscles = [...new Set(exerciseLibrary.map(ex => ex.muscle))];
    tabsDiv.innerHTML = "";
    muscles.forEach(m => { tabsDiv.innerHTML += `<button class="tab-btn ${m === currentMuscleTab ? 'active-tab' : ''}" onclick="changeMuscleTab('${m}')">${m}</button>`; });
    const libDiv = document.getElementById('exercises-library'); libDiv.innerHTML = "";
    exerciseLibrary.filter(ex => ex.muscle === currentMuscleTab).forEach((ex) => {
        const globalIndex = exerciseLibrary.indexOf(ex);
        libDiv.innerHTML += `<div class="exercise-lib-item"><img src="${ex.img}" alt="${ex.name}" class="ex-thumb" onerror="this.onerror=null; this.src='https://placehold.co/200x200/1f2024/b5c7eb?text=AcadeMax';"><div class="ex-info"><span>${ex.name}</span><button class="btn-video" onclick="openVideo('${ex.name}')"><i class="fa-solid fa-circle-play"></i> Ver Vídeo</button></div><button class="btn-add-lib" onclick="openExerciseConfig(${globalIndex})"><i class="fa-solid fa-plus"></i> Add</button></div>`;
    });
}
function changeMuscleTab(muscle) { currentMuscleTab = muscle; renderLibrary(); }

function renderAddedExercises() {
    const addedDiv = document.getElementById('added-exercises-list');
    document.getElementById('added-count').innerText = tempExercisesToAdd.length;
    if (tempExercisesToAdd.length === 0) { addedDiv.innerHTML = "<p style='color: var(--text-muted); font-size: 13px; padding: 5px 0;'>Nenhum exercício adicionado.</p>"; return; }
    addedDiv.innerHTML = "";
    tempExercisesToAdd.forEach((ex, index) => { addedDiv.innerHTML += `<div class="added-item"><span><i class="fa-solid fa-check"></i> ${ex.name} (${ex.sets.length} séries)</span><button class="btn-remove" onclick="removeAddedExercise(${index})">Remover</button></div>`; });
}
function removeAddedExercise(index) { tempExercisesToAdd.splice(index, 1); renderAddedExercises(); }
function closeCreateModal() { targetUserIdForWorkout = null; document.getElementById('create-workout-modal').classList.add('hidden'); }

let currentExerciseConfig = null; let tempSetsCount = 3;
function openExerciseConfig(libIndex) { currentExerciseConfig = exerciseLibrary[libIndex]; tempSetsCount = 3; document.getElementById('modal-title').innerText = currentExerciseConfig.name; document.getElementById('exercise-modal').classList.remove('hidden'); updateSetsUI(); }
function adjustSets(val) { tempSetsCount += val; if (tempSetsCount < 1) tempSetsCount = 1; updateSetsUI(); }
function updateSetsUI() {
    document.getElementById('sets-count').innerText = tempSetsCount;
    const container = document.getElementById('sets-config-container');
    let html = `<div class="set-row-labels"><span>Série</span><span>Reps</span><span>Carga (kg)</span></div>`;
    for(let i=0; i<tempSetsCount; i++) { html += `<div class="set-row"><span class="set-num-label">${i+1}</span><input type="number" value="10" id="reps-${i}"><input type="number" value="20" id="weight-${i}"></div>`; }
    container.innerHTML = html;
}
function saveExercise() {
    let sets = [];
    for(let i=0; i<tempSetsCount; i++) { sets.push({ reps: parseInt(document.getElementById(`reps-${i}`).value), weight: parseFloat(document.getElementById(`weight-${i}`).value) }); }
    tempExercisesToAdd.push({ name: currentExerciseConfig.name, sets: sets, restTime: 60 });
    document.getElementById('exercise-modal').classList.add('hidden'); renderAddedExercises();
}
function closeModal() { document.getElementById('exercise-modal').classList.add('hidden'); }

async function saveNewWorkout() {
    const name = document.getElementById('new-workout-name').value;
    const desc = document.getElementById('new-workout-desc').value;
    if (!name || tempExercisesToAdd.length === 0) { alert("Dê um nome e adicione exercícios."); return; }
    const userId = targetUserIdForWorkout || loggedUser.id;
    await fetch(`${API}/workouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, desc, exercises: tempExercisesToAdd, userId }) });
    if (!targetUserIdForWorkout) {
        const newWorkout = { id: Date.now().toString(), name, desc, exercises: tempExercisesToAdd };
        if (editingWorkoutId) { const workout = DB.workouts.find(w => w.id === editingWorkoutId); workout.name = name; workout.desc = desc; workout.exercises = tempExercisesToAdd; } else { DB.workouts.push(newWorkout); }
        renderWorkouts();
    } else { viewClient(targetUserIdForWorkout); }
    editingWorkoutId = null; targetUserIdForWorkout = null; closeCreateModal(); 
}
// --- LÓGICA DO MODO TREINO ATIVO ---
let activeWorkout = null; let activeExerciseIndex = 0; let flatSets = []; let timerInterval = null; let timeLeft = 0;

function startWorkout(workoutId) {
    if (!workoutId && DB.workouts.length > 0) { workoutId = DB.workouts[0].id; }
    activeWorkout = DB.workouts.find(w => w.id === workoutId);
    if (!activeWorkout) { alert("Crie um treino primeiro."); return; }
    clearInterval(timerInterval); timeLeft = 0; flatSets = [];
    activeWorkout.exercises.forEach((ex) => { ex.sets.forEach((set, setIdx) => { flatSets.push({ exName: ex.name, setIdx: setIdx, totalSets: ex.sets.length, plannedReps: set.reps, plannedWeight: set.weight, restTime: ex.restTime }); }); });
    activeExerciseIndex = 0; navigateTo('active-workout'); renderActiveSet();
}
function resumeWorkout() {
    if (!activeWorkout || activeExerciseIndex >= flatSets.length) { alert("Nenhum treino em andamento."); return; }
    clearInterval(timerInterval); timeLeft = 0;
    document.getElementById('rest-timer').classList.add('hidden'); document.getElementById('exercise-active-view').classList.remove('hidden');
    navigateTo('active-workout'); renderActiveSet();
}
function renderActiveSet() {
    if (activeExerciseIndex >= flatSets.length) { finishWorkout(); return; }
    let currentSet = flatSets[activeExerciseIndex];
    document.getElementById('active-exercise-name').innerText = currentSet.exName;
    document.getElementById('active-set-num').innerText = currentSet.setIdx + 1;
    document.getElementById('active-total-sets').innerText = currentSet.totalSets;
    document.getElementById('active-reps').value = currentSet.plannedReps;
    document.getElementById('active-weight').value = currentSet.plannedWeight;
    document.getElementById('workout-progress').style.width = `${(activeExerciseIndex / flatSets.length) * 100}%`;
    document.getElementById('rest-timer').classList.add('hidden'); document.getElementById('exercise-active-view').classList.remove('hidden');
}
function completeSet() {
    let currentSet = flatSets[activeExerciseIndex];
    currentSet.actualReps = parseInt(document.getElementById('active-reps').value);
    currentSet.actualWeight = parseFloat(document.getElementById('active-weight').value);
    activeExerciseIndex++; startRestTimer(currentSet.restTime);
}
function startRestTimer(seconds) {
    document.getElementById('exercise-active-view').classList.add('hidden'); document.getElementById('rest-timer').classList.remove('hidden');
    timeLeft = seconds; document.getElementById('timer-display').innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => { timeLeft--; document.getElementById('timer-display').innerText = timeLeft; if (timeLeft <= 0) { clearInterval(timerInterval); renderActiveSet(); } }, 1000);
}
function adjustTimer(val) { timeLeft = Math.max(0, timeLeft + val); document.getElementById('timer-display').innerText = timeLeft; }
function skipRest() { clearInterval(timerInterval); timeLeft = 0; renderActiveSet(); }

async function finishWorkout() {
    clearInterval(timerInterval); timeLeft = 0;
    if (activeWorkout) {
        let volume = 0;
        flatSets.forEach(s => { if (s.actualReps && s.actualWeight) volume += (s.actualReps * s.actualWeight); });
        await fetch(`${API}/history`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: loggedUser.id, workoutId: activeWorkout.id, volume, sets: flatSets }) });
        DB.history.push({ id: Date.now().toString(), workoutName: activeWorkout.name, date: new Date().toISOString(), volume, sets: flatSets });
        alert("🎉 Treino Concluído! Volume: " + volume.toFixed(1) + " kg");
    }
    activeWorkout = null; activeExerciseIndex = 0; flatSets = [];
    navigateTo('dashboard');
}

// --- EVOLUÇÃO ---
let progressionChart = null;
function renderProgression() {
    const select = document.getElementById('progression-select');
    select.innerHTML = '<option value="">Selecione...</option>';
    const uniqueExercises = new Set(); let allRecords = [];
    DB.history.forEach(session => { session.sets.forEach(set => { if (set.exName) uniqueExercises.add(set.exName); if (set.actualWeight) allRecords.push({ date: new Date(session.date).toLocaleDateString('pt-BR'), weight: set.actualWeight }); }); });
    const exArray = Array.from(uniqueExercises).sort();
    exArray.forEach(ex => { select.innerHTML += `<option value="${ex}">${ex}</option>`; });
    calculateTimeStats(allRecords);
    document.getElementById('progression-stats').classList.add('hidden'); document.getElementById('progression-list').innerHTML = "";
    if (progressionChart) progressionChart.destroy();
    if (exArray.length > 0) { select.value = exArray[0]; loadExerciseProgression(exArray[0]); } else { document.getElementById('progression-list').innerHTML = "<p class='subtitle'>Nenhum treino realizado ainda. Faça um treino para ver sua evolução!</p>"; }
}
function calculateTimeStats(records) {
    if (records.length === 0) { document.getElementById('stat-week').innerText = "0 kg"; document.getElementById('stat-month').innerText = "0 kg"; document.getElementById('stat-year').innerText = "0 kg"; return; }
    const today = new Date(); let maxWeek = 0, maxMonth = 0, maxYear = 0;
    records.forEach(rec => { const parts = rec.date.split('/'); const recDate = new Date(parts[2], parts[1] - 1, parts[0]); if (recDate.getFullYear() === today.getFullYear()) { if (rec.weight > maxYear) maxYear = rec.weight; if (recDate.getMonth() === today.getMonth()) { if (rec.weight > maxMonth) maxMonth = rec.weight; const diffDays = Math.floor((today - recDate) / (1000 * 60 * 60 * 24)); if (diffDays <= 7 && rec.weight > maxWeek) maxWeek = rec.weight; } } });
    document.getElementById('stat-week').innerText = maxWeek + " kg"; document.getElementById('stat-month').innerText = maxMonth + " kg"; document.getElementById('stat-year').innerText = maxYear + " kg";
}
function loadExerciseProgression(exName) {
    if (!exName) { document.getElementById('progression-stats').classList.add('hidden'); document.getElementById('progression-list').innerHTML = ""; if (progressionChart) progressionChart.destroy(); return; }
    let records = [];
    DB.history.forEach(session => { session.sets.forEach(set => { if (set.exName === exName && set.actualWeight) records.push({ date: new Date(session.date).toLocaleDateString('pt-BR'), weight: set.actualWeight, reps: set.actualReps }); }); });
    if (records.length === 0) { document.getElementById('progression-stats').classList.add('hidden'); document.getElementById('progression-list').innerHTML = "<p class='subtitle'>Sem dados.</p>"; return; }
    const weights = records.map(r => r.weight);
    document.getElementById('prog-start-weight').innerText = weights[0] + " kg"; document.getElementById('prog-max-weight').innerText = Math.max(...weights) + " kg";
    document.getElementById('progression-stats').classList.remove('hidden');
    const listDiv = document.getElementById('progression-list'); listDiv.innerHTML = "";
    records.reverse().forEach((rec) => { const isRecord = rec.weight === Math.max(...weights); listDiv.innerHTML += `<div class="prog-item"><div class="prog-date"><span class="day">${rec.date}</span><span class="reps">${rec.reps} reps</span></div><div style="display: flex; align-items: center;"><span class="prog-weight">${rec.weight} kg</span>${isRecord ? '<span class="prog-record"><i class="fa-solid fa-trophy"></i> Recorde</span>' : ''}</div></div>`; });
    const ctx = document.getElementById('progressionChart').getContext('2d');
    if (progressionChart) progressionChart.destroy();
    progressionChart = new Chart(ctx, { type: 'line', data: { labels: records.map(r => r.date), datasets: [{ label: 'Carga (kg)', data: weights, borderColor: '#b5c7eb', backgroundColor: 'rgba(181, 199, 235, 0.1)', borderWidth: 3, fill: true, tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f2f5f7' } } }, scales: { y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6e76' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6e76' } } } } });
}

// --- CALCULADORA DE IMC ---
function calculateIMC() {
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const heightCm = parseFloat(document.getElementById('calc-height').value);
    const gender = document.getElementById('calc-gender').value;
    const waist = parseFloat(document.getElementById('calc-waist').value);
    const neck = parseFloat(document.getElementById('calc-neck').value);
    if (!weight || !heightCm) { alert("Preencha pelo menos peso e altura!"); return; }
    const heightM = heightCm / 100;
    const imc = weight / (heightM * heightM);
    let imcClass = "Peso normal";
    if (imc < 18.5) imcClass = "Abaixo do peso"; else if (imc >= 25 && imc < 30) imcClass = "Sobrepeso"; else if (imc >= 30) imcClass = "Obesidade";
    let fatPercent = "--"; let fatClass = "Preencha cintura e pescoço";
    if (waist && neck) {
        if (gender === 'male') { fatPercent = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCm)) - 450; } else { fatPercent = 163.205 * Math.log10(waist - neck) - 97.684 * Math.log10(heightCm) - 78.387; }
        if (fatPercent !== "--" && !isNaN(fatPercent)) {
            fatPercent = fatPercent.toFixed(1);
            if (gender === 'male') { if (fatPercent < 6) fatClass = "Essencial"; else if (fatPercent < 14) fatClass = "Atleta"; else if (fatPercent < 18) fatClass = "Boa forma"; else if (fatPercent < 25) fatClass = "Aceitável"; else fatClass = "Elevada"; } 
            else { if (fatPercent < 14) fatClass = "Essencial"; else if (fatPercent < 21) fatClass = "Atleta"; else if (fatPercent < 25) fatClass = "Boa forma"; else if (fatPercent < 31) fatClass = "Aceitável"; else fatClass = "Elevada"; }
        }
    }
    document.getElementById('res-imc').innerText = imc.toFixed(1); document.getElementById('res-imc-class').innerText = imcClass;
    document.getElementById('res-fat').innerText = fatPercent; document.getElementById('res-fat-class').innerText = fatClass;
    document.getElementById('imc-result').classList.remove('hidden');
}

// --- PERFIL ---
function loadProfileData() {
    let userData = loggedUser;
    const profileHTML = `
        <h1>Perfil</h1>
        <div class="card" style="text-align: center;">
            ${userData.picture ? `<img src="${userData.picture}" alt="Foto" style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 15px; display: block; border: 3px solid var(--primary); object-fit: cover;">` : `<div style="width: 100px; height: 100px; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;"><i class="fa-solid fa-user" style="font-size: 40px; color: var(--text-muted);"></i></div>`}
            <h3 style="font-size: 22px; margin-bottom: 5px;">${userData.name || 'Atleta'}</h3>
            ${userData.isAdmin ? '<span style="display: inline-block; font-size: 11px; background: var(--primary); color: #0b0c0e; padding: 4px 12px; border-radius: 10px; margin-bottom: 20px; font-weight: 600;">Administrador</span>' : '<span style="display: inline-block; font-size: 11px; background: var(--bg-input); color: var(--text-muted); padding: 4px 12px; border-radius: 10px; margin-bottom: 20px;">Cliente</span>'}
            <div style="text-align: left; margin-top: 15px;">
                <p style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;"><i class="fa-solid fa-envelope" style="color: var(--primary); width: 20px; text-align: center;"></i> ${userData.email || 'Email não encontrado'}</p>
                <p style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;"><i class="fa-solid fa-phone" style="color: var(--primary); width: 20px; text-align: center;"></i> ${userData.phone || 'Telefone não cadastrado'}</p>
                <p style="display: flex; align-items: center; gap: 12px;"><i class="fa-solid fa-weight-hanging" style="color: var(--primary); width: 20px; text-align: center;"></i> Unidade de Peso: kg</p>
            </div>
            <button class="btn-primary btn-full" style="margin-top: 20px;" onclick="editProfile()"><i class="fa-solid fa-pen"></i> Editar Perfil</button>
        </div>
        <button class="btn-danger-outline btn-full" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Sair da Conta</button>
    `;
    document.getElementById('view-profile').innerHTML = profileHTML;
}
function editProfile() {
    let userData = loggedUser;
    document.getElementById('view-profile').innerHTML = `
        <h1>Editar Perfil</h1>
        <div class="card">
            <label>Nome</label><input type="text" id="edit-name" value="${userData.name || ''}" style="margin-bottom: 15px;">
            <label>URL da Foto de Perfil</label><input type="text" id="edit-picture" value="${userData.picture || ''}" placeholder="Cole o link da imagem aqui" style="margin-bottom: 15px;">
            <label>Telefone</label><input type="tel" id="edit-phone" value="${userData.phone || ''}" placeholder="Ex: (11) 99999-9999" style="margin-bottom: 15px;">
            <div class="modal-actions" style="margin-top: 10px;">
                <button class="btn-danger-outline" onclick="loadProfileData()">Cancelar</button>
                <button class="btn-primary" onclick="saveProfile()"><i class="fa-solid fa-check"></i> Salvar</button>
            </div>
        </div>
    `;
}
async function saveProfile() {
    const newName = document.getElementById('edit-name').value; const newPicture = document.getElementById('edit-picture').value; const newPhone = document.getElementById('edit-phone').value;
    if (!newName) { alert("O nome não pode ficar vazio!"); return; }
    try {
        const res = await fetch(`${API}/users/${loggedUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, picture: newPicture, phone: newPhone }) });
        const data = await res.json(); if (data.error) { alert(data.error); return; }
        localStorage.setItem('gympro_user', JSON.stringify(data)); alert("Perfil atualizado com sucesso!"); loadProfileData();
    } catch (err) { alert("Erro de conexão."); }
}
function logout() { if(confirm("Deseja realmente sair da conta?")) { localStorage.removeItem('gympro_user'); window.location.href = 'login.html'; } }

// --- PAINEL ADMIN (CLIENTES) ---
function checkAdminStatus() { const navClients = document.getElementById('nav-clients'); if (loggedUser.isAdmin) { navClients.style.display = 'flex'; } else { navClients.style.display = 'none'; } }
async function renderClients() {
    const list = document.getElementById('clients-list'); list.innerHTML = "<p class='subtitle'>Carregando clientes...</p>";
    const res = await fetch(`${API}/users`); globalClients = await res.json();
    if (globalClients.length === 0) { list.innerHTML = "<p class='subtitle'>Nenhum cliente cadastrado.</p>"; return; }
    list.innerHTML = "";
    globalClients.forEach(u => {
        list.innerHTML += `<div class="client-card"><div class="client-info"><div class="client-avatar">${u.picture ? `<img src="${u.picture}" alt="${u.name}">` : `<i class="fa-solid fa-user"></i>`}</div><div class="client-details"><h3>${u.name} ${u.isAdmin ? '<span class="admin-badge">ADMIN</span>' : ''}</h3><p>${u.email}</p></div></div><button class="manage-btn" onclick="viewClient('${u.id}')"><i class="fa-solid fa-gear"></i> Gerenciar</button></div>`;
    });
}
async function viewClient(id) {
    const client = globalClients.find(u => u.id === id); if (!client) return;
    document.getElementById('manage-client-title').innerText = "Gerenciar: " + client.name;
    document.getElementById('manage-client-content').innerHTML = "<p class='subtitle'>Carregando dados...</p>";
    let workoutsHTML = "<p class='subtitle'>Nenhum treino recomendado ainda.</p>";
    try {
        const resWorkouts = await fetch(`${API}/workouts/${id}`); const clientWorkouts = await resWorkouts.json();
        if (clientWorkouts.length > 0) { workoutsHTML = ""; clientWorkouts.forEach(w => { workoutsHTML += `<div class="workout-item"><div class="workout-info"><h3>${w.name}</h3><p>${w.desc} - ${w.exercises.length} exercícios</p></div></div>`; }); }
    } catch (err) { workoutsHTML = "<p class='subtitle'>Erro ao carregar treinos.</p>"; }
    document.getElementById('manage-client-content').innerHTML = `
        <div class="card"><h3 style="margin-bottom: 15px;"><i class="fa-solid fa-user-pen"></i> Editar Perfil</h3><label>Nome</label><input type="text" id="admin-edit-name" value="${client.name}" style="margin-bottom: 15px;"><label>URL da Foto</label><input type="text" id="admin-edit-picture" value="${client.picture || ''}" style="margin-bottom: 15px;"><label>Telefone</label><input type="tel" id="admin-edit-phone" value="${client.phone || ''}" style="margin-bottom: 20px;"><button class="btn-primary btn-full" onclick="adminSaveClient('${id}')"><i class="fa-solid fa-check"></i> Salvar Alterações</button></div>
        <div class="card"><div class="header-flex" style="margin-bottom: 15px;"><h3 style="margin:0;"><i class="fa-solid fa-dumbbell"></i> Treinos Recomendados</h3><button class="btn-primary" style="width: auto; margin:0; padding: 10px 15px; font-size: 14px;" onclick="adminAddWorkout('${id}')"><i class="fa-solid fa-plus"></i> Recomendar</button></div><div class="workouts-list">${workoutsHTML}</div></div>
        <div class="card danger-zone"><h3 style="margin-bottom: 15px;"><i class="fa-solid fa-triangle-exclamation"></i> Zona de Perigo</h3><button class="btn-danger btn-full" onclick="adminDeleteClient('${id}')"><i class="fa-solid fa-trash-can"></i> Excluir Conta</button></div>
    `;
    navigateTo('manage-client');
}
async function adminSaveClient(id) {
    const newName = document.getElementById('admin-edit-name').value; const newPicture = document.getElementById('admin-edit-picture').value; const newPhone = document.getElementById('admin-edit-phone').value;
    try {
        const res = await fetch(`${API}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, picture: newPicture, phone: newPhone }) });
        const data = await res.json(); if (data.error) { alert(data.error); return; }
        const index = globalClients.findIndex(u => u.id === id); if (index >= 0) globalClients[index] = data;
        alert("Perfil atualizado!"); viewClient(id);
    } catch (err) { alert("Erro de conexão."); }
}
async function adminDeleteClient(id) {
    if (confirm("EXCLUIR este cliente permanentemente?")) {
        try {
            const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' }); const data = await res.json(); if (data.error) { alert(data.error); return; }
            alert("Cliente excluído!"); navigateTo('clients'); renderClients();
        } catch (err) { alert("Erro de conexão."); }
    }
}
function adminAddWorkout(id) { targetUserIdForWorkout = id; openCreateWorkoutModal(); }

// Inicia a aplicação
checkAdminStatus();
loadDB();