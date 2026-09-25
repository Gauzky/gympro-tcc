// Segurança
if (!localStorage.getItem('gympro_user')) {
    window.location.href = 'login.html';
}

const loggedUser = JSON.parse(localStorage.getItem('gympro_user') || '{}');
const API = 'https://academax-backend.onrender.com/api';

// Banco de dados em memória (carregado da API) 
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

// Variáveis globais para o Admin gerenciar clientes
let currentViewingClientEmail = null;
let targetUserEmailForWorkout = null;

const exerciseLibrary = [
    // PEITO
    { name: "Supino Reto", muscle: "Peito", icon: "fa-solid fa-dumbbell", video: "rT7DgCr-3pg" },
    { name: "Supino Inclinado", muscle: "Peito", icon: "fa-solid fa-dumbbell", video: "8iPEnn-ltC8" },
    { name: "Crucifixo", muscle: "Peito", icon: "fa-solid fa-child-reaching", video: "e7XVB3pXyIQ" },
    { name: "Crossover", muscle: "Peito", icon: "fa-solid fa-arrows-left-right", video: "I5i1b5J4fPw" },
    { name: "Flexão de Braço", muscle: "Peito", icon: "fa-solid fa-person-falling", video: "IODKqqHjHnI" },
    // COSTAS
    { name: "Puxada Frontal", muscle: "Costas", icon: "fa-solid fa-arrow-down-long", video: "CAo7hKvxeXQ" },
    { name: "Remada Curvada", muscle: "Costas", icon: "fa-solid fa-arrows-up-to-line", video: "kBji6j5XNQ4" },
    { name: "Remada Baixa", muscle: "Costas", icon: "fa-solid fa-anchor", video: "pApl4TKy1UM" },
    { name: "Levantamento Terra", muscle: "Costas", icon: "fa-solid fa-weight-hanging", video: "Nyju6b1Z3UE" },
    // PERNAS
    { name: "Agachamento", muscle: "Pernas", icon: "fa-solid fa-person-walking", video: "ultWZbUMPL8" },
    { name: "Leg Press", muscle: "Pernas", icon: "fa-solid fa-truck-ramp-box", video: "IZQ0Q1N_NtU" },
    { name: "Cadeira Extensora", muscle: "Pernas", icon: "fa-solid fa-chair", video: "t3D1F4q6p9w" },
    { name: "Panturrilha", muscle: "Pernas", icon: "fa-solid fa-shoe-prints", video: "3b5d1w5p2Q8" },
    // BÍCEPS
    { name: "Rosca Direta", muscle: "Bíceps", icon: "fa-solid fa-hand-fist", video: "kwG2ipFRgfo" },
    { name: "Rosca Martelo", muscle: "Bíceps", icon: "fa-solid fa-hammer", video: "z4eR3Nk5L6o" },
    // TRÍCEPS
    { name: "Tríceps Pulley", muscle: "Tríceps", icon: "fa-solid fa-bolt", video: "2j5j3w4Q5e" },
    { name: "Tríceps Testa", muscle: "Tríceps", icon: "fa-solid fa-brain", video: "5l3qJ4N8wQ" },
    // OMBRO
    { name: "Desenvolvimento", muscle: "Ombro", icon: "fa-solid fa-arrow-up-from-bracket", video: "q4eR3Nk5L6" },
    { name: "Elevação Lateral", muscle: "Ombro", icon: "fa-solid fa-arrows-up-down", video: "3d1w5p2Q8c" },
    // ABDÔMEN
    { name: "Abdominal Supra", muscle: "Abdômen", icon: "fa-solid fa-burger", video: "IODKqqHjHnI" },
    { name: "Prancha", muscle: "Abdômen", icon: "fa-solid fa-plumber", video: "ASdvN98wQ" }
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
    if (activeWorkout && activeExerciseIndex < flatSets.length) {
        resumeBtn.style.display = 'flex';
    } else {
        resumeBtn.style.display = 'none';
    }
}

function renderWorkouts() {
    const list = document.getElementById('workouts-list');
    list.innerHTML = DB.workouts.length === 0 ? "<p class='subtitle'>Nenhum treino criado.</p>" : "";
    DB.workouts.forEach(w => {
        list.innerHTML += `
            <div class="workout-item">
                <div class="workout-info"><h3>${w.name}</h3><p>${w.desc} - ${w.exercises.length} exercícios</p></div>
                <div class="workout-actions">
                    <button class="btn-action btn-edit" onclick="editWorkout('${w.id}')"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteWorkout('${w.id}')"><i class="fa-solid fa-trash-can"></i> Excluir</button>
                    <button class="btn-action btn-start" onclick="startWorkout('${w.id}')"><i class="fa-solid fa-play"></i> Iniciar</button>
                </div>
            </div>
        `;
    });
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = DB.history.length === 0 ? "<p class='subtitle'>Nenhum treino realizado.</p>" : "";
    DB.history.slice().reverse().forEach(h => {
        list.innerHTML += `<div class="workout-item"><div class="workout-info"><h3>${h.workoutName}</h3><p>${new Date(h.date).toLocaleDateString('pt-BR')} | Volume: ${h.volume.toFixed(1)} kg</p></div></div>`;
    });
}

function openVideo(videoId, name) {
    document.getElementById('video-title').innerText = name;
    document.getElementById('video-iframe').src = `https://www.youtube.com/embed/${videoId}`;
    document.getElementById('video-modal').classList.remove('hidden');
}
function closeVideoModal() { document.getElementById('video-iframe').src = ""; document.getElementById('video-modal').classList.add('hidden'); }

let tempExercisesToAdd = [];
let editingWorkoutId = null;

function openCreateWorkoutModal() {
    editingWorkoutId = null; tempExercisesToAdd = [];
    document.getElementById('new-workout-name').value = ""; document.getElementById('new-workout-desc').value = "";
    document.getElementById('form-modal-title').innerText = "Criar Novo Treino";
    document.getElementById('save-workout-btn').innerText = "Salvar Treino";
    document.getElementById('create-workout-modal').classList.remove('hidden');
    renderAddedExercises(); renderLibrary();
}

function editWorkout(id) {
    const workout = DB.workouts.find(w => w.id === id);
    if (!workout) return;
    editingWorkoutId = id;
    tempExercisesToAdd = JSON.parse(JSON.stringify(workout.exercises));
    document.getElementById('new-workout-name').value = workout.name;
    document.getElementById('new-workout-desc').value = workout.desc;
    document.getElementById('form-modal-title').innerText = "Editar Treino";
    document.getElementById('save-workout-btn').innerText = "Atualizar Treino";
    document.getElementById('create-workout-modal').classList.remove('hidden');
    renderAddedExercises(); renderLibrary();
}

async function deleteWorkout(id) {
    if (confirm("Excluir este treino?")) {
        // Idealmente chamar a API para deletar, aqui só removemos da tela
        DB.workouts = DB.workouts.filter(w => w.id !== id);
        renderWorkouts();
        alert("Treino excluído (localmente). Para excluir do banco, crie uma rota DELETE no backend.");
    }
}

let currentMuscleTab = "Peito"; // Aba padrão

function renderLibrary() {
    // Renderiza as abas
    const tabsDiv = document.getElementById('exercises-tabs');
    const muscles = [...new Set(exerciseLibrary.map(ex => ex.muscle))];
    tabsDiv.innerHTML = "";
    muscles.forEach(m => {
        tabsDiv.innerHTML += `<button class="tab-btn ${m === currentMuscleTab ? 'active-tab' : ''}" onclick="changeMuscleTab('${m}')">${m}</button>`;
    });

    // Renderiza a lista
    const libDiv = document.getElementById('exercises-library');
    libDiv.innerHTML = "";
    const filteredExercises = exerciseLibrary.filter(ex => ex.muscle === currentMuscleTab);
    
    filteredExercises.forEach((ex) => {
        const globalIndex = exerciseLibrary.indexOf(ex);
        libDiv.innerHTML += `
            <div class="exercise-lib-item">
                <div class="ex-thumb"><i class="${ex.icon}"></i></div>
                <div class="ex-info">
                    <span>${ex.name}</span>
                    <button class="btn-video" onclick="openVideo('${ex.video}', '${ex.name}')"><i class="fa-solid fa-circle-play"></i> Ver Vídeo</button>
                </div>
                <button class="btn-add-lib" onclick="openExerciseConfig(${globalIndex})"><i class="fa-solid fa-plus"></i> Add</button>
            </div>
        `;
    });
}

function changeMuscleTab(muscle) {
    currentMuscleTab = muscle;
    renderLibrary();
}

function renderAddedExercises() {
    const addedDiv = document.getElementById('added-exercises-list');
    document.getElementById('added-count').innerText = tempExercisesToAdd.length;
    if (tempExercisesToAdd.length === 0) {
        addedDiv.innerHTML = "<p style='color: var(--text-muted); font-size: 13px; padding: 5px 0;'>Nenhum exercício adicionado.</p>";
        return;
    }
    addedDiv.innerHTML = "";
    tempExercisesToAdd.forEach((ex, index) => {
        addedDiv.innerHTML += `<div class="added-item"><span><i class="fa-solid fa-check"></i> ${ex.name} (${ex.sets.length} séries)</span><button class="btn-remove" onclick="removeAddedExercise(${index})">Remover</button></div>`;
    });
}

function removeAddedExercise(index) { tempExercisesToAdd.splice(index, 1); renderAddedExercises(); }
function closeCreateModal() { targetUserEmailForWorkout = null; document.getElementById('create-workout-modal').classList.add('hidden'); }

let currentExerciseConfig = null;
let tempSetsCount = 3;

function openExerciseConfig(libIndex) {
    currentExerciseConfig = exerciseLibrary[libIndex];
    tempSetsCount = 3;
    document.getElementById('modal-title').innerText = currentExerciseConfig.name;
    document.getElementById('exercise-modal').classList.remove('hidden');
    updateSetsUI();
}

function adjustSets(val) { tempSetsCount += val; if (tempSetsCount < 1) tempSetsCount = 1; updateSetsUI(); }

function updateSetsUI() {
    document.getElementById('sets-count').innerText = tempSetsCount;
    const container = document.getElementById('sets-config-container');
    let html = `<div class="set-row-labels"><span>Série</span><span>Reps</span><span>Carga (kg)</span></div>`;
    for(let i=0; i<tempSetsCount; i++) {
        html += `<div class="set-row"><span class="set-num-label">${i+1}</span><input type="number" value="10" id="reps-${i}"><input type="number" value="20" id="weight-${i}"></div>`;
    }
    container.innerHTML = html;
}

function saveExercise() {
    let sets = [];
    for(let i=0; i<tempSetsCount; i++) {
        sets.push({ reps: parseInt(document.getElementById(`reps-${i}`).value), weight: parseFloat(document.getElementById(`weight-${i}`).value) });
    }
    tempExercisesToAdd.push({ name: currentExerciseConfig.name, sets: sets, restTime: 60 });
    document.getElementById('exercise-modal').classList.add('hidden');
    renderAddedExercises();
}

function closeModal() { document.getElementById('exercise-modal').classList.add('hidden'); }

async function saveNewWorkout() {
    const name = document.getElementById('new-workout-name').value;
    const desc = document.getElementById('new-workout-desc').value;
    if (!name || tempExercisesToAdd.length === 0) { alert("Dê um nome e adicione exercícios."); return; }

    const newWorkout = { id: Date.now().toString(), name, desc, exercises: tempExercisesToAdd };

    // Manda para a API (Banco de dados real)
    await fetch(`${API}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, desc, exercises: tempExercisesToAdd, userId: loggedUser.id })
    });

    if (!editingWorkoutId) DB.workouts.push(newWorkout);
    editingWorkoutId = null;
    closeCreateModal(); renderWorkouts();
}

// --- LÓGICA DO MODO TREINO ATIVO ---
let activeWorkout = null;
let activeExerciseIndex = 0;
let flatSets = [];
let timerInterval = null;
let timeLeft = 0;

function startWorkout(workoutId) {
    if (!workoutId && DB.workouts.length > 0) { workoutId = DB.workouts[0].id; }
    activeWorkout = DB.workouts.find(w => w.id === workoutId);
    if (!activeWorkout) { alert("Crie um treino primeiro."); return; }

    clearInterval(timerInterval); timeLeft = 0; flatSets = [];
    activeWorkout.exercises.forEach((ex) => {
        ex.sets.forEach((set, setIdx) => {
            flatSets.push({ exName: ex.name, setIdx: setIdx, totalSets: ex.sets.length, plannedReps: set.reps, plannedWeight: set.weight, restTime: ex.restTime });
        });
    });
    activeExerciseIndex = 0; navigateTo('active-workout'); renderActiveSet();
}

function resumeWorkout() {
    if (!activeWorkout || activeExerciseIndex >= flatSets.length) { alert("Nenhum treino em andamento."); return; }
    clearInterval(timerInterval); timeLeft = 0;
    document.getElementById('rest-timer').classList.add('hidden');
    document.getElementById('exercise-active-view').classList.remove('hidden');
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
    document.getElementById('rest-timer').classList.add('hidden');
    document.getElementById('exercise-active-view').classList.remove('hidden');
}

function completeSet() {
    let currentSet = flatSets[activeExerciseIndex];
    currentSet.actualReps = parseInt(document.getElementById('active-reps').value);
    currentSet.actualWeight = parseFloat(document.getElementById('active-weight').value);
    activeExerciseIndex++; startRestTimer(currentSet.restTime);
}

function startRestTimer(seconds) {
    document.getElementById('exercise-active-view').classList.add('hidden');
    document.getElementById('rest-timer').classList.remove('hidden');
    timeLeft = seconds; document.getElementById('timer-display').innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--; document.getElementById('timer-display').innerText = timeLeft;
        if (timeLeft <= 0) { clearInterval(timerInterval); renderActiveSet(); }
    }, 1000);
}

function adjustTimer(val) { timeLeft = Math.max(0, timeLeft + val); document.getElementById('timer-display').innerText = timeLeft; }
function skipRest() { clearInterval(timerInterval); timeLeft = 0; renderActiveSet(); }

async function finishWorkout() {
    clearInterval(timerInterval); timeLeft = 0;
    if (activeWorkout) {
        let volume = 0;
        flatSets.forEach(s => { if (s.actualReps && s.actualWeight) volume += (s.actualReps * s.actualWeight); });
        
        // Salva no Banco de Dados
        await fetch(`${API}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: loggedUser.id, workoutId: activeWorkout.id, volume, sets: flatSets })
        });

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
    const uniqueExercises = new Set();
    let allRecords = [];
    DB.history.forEach(session => {
        session.sets.forEach(set => {
            uniqueExercises.add(set.exName);
            if (set.actualWeight) allRecords.push({ date: new Date(session.date).toLocaleDateString('pt-BR'), weight: set.actualWeight });
        });
    });
    Array.from(uniqueExercises).sort().forEach(ex => { select.innerHTML += `<option value="${ex}">${ex}</option>`; });
    calculateTimeStats(allRecords);
    document.getElementById('progression-stats').classList.add('hidden');
    document.getElementById('progression-list').innerHTML = "";
    if (progressionChart) progressionChart.destroy();
}

function calculateTimeStats(records) {
    if (records.length === 0) {
        document.getElementById('stat-week').innerText = "0 kg";
        document.getElementById('stat-month').innerText = "0 kg";
        document.getElementById('stat-year').innerText = "0 kg";
        return;
    }
    const today = new Date(); let maxWeek = 0, maxMonth = 0, maxYear = 0;
    records.forEach(rec => {
        const parts = rec.date.split('/'); const recDate = new Date(parts[2], parts[1] - 1, parts[0]);
        if (recDate.getFullYear() === today.getFullYear()) {
            if (rec.weight > maxYear) maxYear = rec.weight;
            if (recDate.getMonth() === today.getMonth()) {
                if (rec.weight > maxMonth) maxMonth = rec.weight;
                const diffDays = Math.floor((today - recDate) / (1000 * 60 * 60 * 24));
                if (diffDays <= 7 && rec.weight > maxWeek) maxWeek = rec.weight;
            }
        }
    });
    document.getElementById('stat-week').innerText = maxWeek + " kg";
    document.getElementById('stat-month').innerText = maxMonth + " kg";
    document.getElementById('stat-year').innerText = maxYear + " kg";
}

function loadExerciseProgression(exName) {
    if (!exName) { document.getElementById('progression-stats').classList.add('hidden'); document.getElementById('progression-list').innerHTML = ""; if (progressionChart) progressionChart.destroy(); return; }
    let records = [];
    DB.history.forEach(session => {
        session.sets.forEach(set => {
            if (set.exName === exName && set.actualWeight) records.push({ date: new Date(session.date).toLocaleDateString('pt-BR'), weight: set.actualWeight, reps: set.actualReps });
        });
    });
    if (records.length === 0) { document.getElementById('progression-stats').classList.add('hidden'); document.getElementById('progression-list').innerHTML = "<p class='subtitle'>Sem dados.</p>"; return; }
    const weights = records.map(r => r.weight);
    document.getElementById('prog-start-weight').innerText = weights[0] + " kg";
    document.getElementById('prog-max-weight').innerText = Math.max(...weights) + " kg";
    document.getElementById('progression-stats').classList.remove('hidden');
    const listDiv = document.getElementById('progression-list'); listDiv.innerHTML = "";
    records.reverse().forEach((rec) => {
        const isRecord = rec.weight === Math.max(...weights);
        listDiv.innerHTML += `<div class="prog-item"><div class="prog-date"><span class="day">${rec.date}</span><span class="reps">${rec.reps} reps</span></div><div style="display: flex; align-items: center;"><span class="prog-weight">${rec.weight} kg</span>${isRecord ? '<span class="prog-record"><i class="fa-solid fa-trophy"></i> Recorde</span>' : ''}</div></div>`;
    });
    const ctx = document.getElementById('progressionChart').getContext('2d');
    if (progressionChart) progressionChart.destroy();
    progressionChart = new Chart(ctx, {
        type: 'line',
        data: { labels: records.map(r => r.date), datasets: [{ label: 'Carga (kg)', data: weights, borderColor: '#b5c7eb', backgroundColor: 'rgba(181, 199, 235, 0.1)', borderWidth: 3, fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f2f5f7' } } }, scales: { y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6e76' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6e76' } } } }
    });
}

// --- PERFIL ---
function loadProfileData() {
    let userData = loggedUser;
    const profileHTML = `
        <h1>Perfil</h1>
        <div class="card" style="text-align: center;">
            ${userData.picture ? 
                `<img src="${userData.picture}" alt="Foto" style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 15px; display: block; border: 3px solid var(--primary); object-fit: cover;">` : 
                `<div style="width: 100px; height: 100px; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;"><i class="fa-solid fa-user" style="font-size: 40px; color: var(--text-muted);"></i></div>`
            }
            <h3 style="font-size: 22px; margin-bottom: 5px;">${userData.name || 'Atleta'}</h3>
            ${userData.isAdmin ? 
                '<span style="display: inline-block; font-size: 11px; background: var(--primary); color: #0b0c0e; padding: 4px 12px; border-radius: 10px; margin-bottom: 20px; font-weight: 600;">Administrador</span>' : 
                '<span style="display: inline-block; font-size: 11px; background: var(--bg-input); color: var(--text-muted); padding: 4px 12px; border-radius: 10px; margin-bottom: 20px;">Cliente</span>'
            }
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
    const editHTML = `
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
    document.getElementById('view-profile').innerHTML = editHTML;
}

async function saveProfile() {
    const newName = document.getElementById('edit-name').value;
    const newPicture = document.getElementById('edit-picture').value;
    const newPhone = document.getElementById('edit-phone').value;
    if (!newName) { alert("O nome não pode ficar vazio!"); return; }
    
    try {
        // Manda os dados para o Render atualizar no banco de dados
        const res = await fetch(`${API}/users/${loggedUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, picture: newPicture, phone: newPhone })
        });
        
        const data = await res.json();
        
        if (data.error) { alert(data.error); return; }
        
        // Atualiza a sessão local com os dados que vieram do banco
        localStorage.setItem('gympro_user', JSON.stringify(data));
        alert("Perfil atualizado com sucesso no banco de dados!");
        loadProfileData(); // Volta para a tela de visualização
    } catch (err) {
        alert("Erro de conexão. O Render pode estar dormindo (demora 50s).");
    }
}

function logout() {
    if(confirm("Deseja realmente sair da conta?")) {
        localStorage.removeItem('gympro_user');
        window.location.href = 'login.html';
    }
}

// --- PAINEL ADMIN (CLIENTES) ---
function checkAdminStatus() {
    const navClients = document.getElementById('nav-clients');
    if (loggedUser.isAdmin) { navClients.style.display = 'flex'; } else { navClients.style.display = 'none'; }
}

async function renderClients() {
    const list = document.getElementById('clients-list');
    list.innerHTML = "<p class='subtitle'>Carregando clientes...</p>";
    const res = await fetch(`${API}/users`);
    const clientsDB = await res.json();
    
    if (clientsDB.length === 0) { list.innerHTML = "<p class='subtitle'>Nenhum cliente cadastrado.</p>"; return; }
    list.innerHTML = "";
    clientsDB.forEach(u => {
        list.innerHTML += `
            <div class="workout-item" style="flex-direction: row; align-items: center; gap: 15px;">
                <div class="workout-info" style="display: flex; align-items: center; gap: 15px;">
                    ${u.picture ? 
                        `<img src="${u.picture}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">` : 
                        `<div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-user" style="color: var(--text-muted);"></i></div>`
                    }
                    <div>
                        <h3>${u.name} ${u.isAdmin ? '<span style="font-size: 10px; background: var(--primary); color: #0b0c0e; padding: 2px 6px; border-radius: 10px; vertical-align: middle; margin-left: 5px;">ADMIN</span>' : ''}</h3>
                        <p style="font-size: 13px;">${u.email}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

// Inicia a aplicação
checkAdminStatus();
loadDB();
// --- CALCULADORA DE IMC E GORDURA ---
function calculateIMC() {
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const heightCm = parseFloat(document.getElementById('calc-height').value);
    const age = parseFloat(document.getElementById('calc-age').value);
    const gender = document.getElementById('calc-gender').value;
    const waist = parseFloat(document.getElementById('calc-waist').value);
    const neck = parseFloat(document.getElementById('calc-neck').value);

    if (!weight || !heightCm) { alert("Preencha pelo menos peso e altura!"); return; }

    const heightM = heightCm / 100;
    const imc = weight / (heightM * heightM);
    
    let imcClass = "Peso normal";
    if (imc < 18.5) imcClass = "Abaixo do peso";
    else if (imc >= 25 && imc < 30) imcClass = "Sobrepeso";
    else if (imc >= 30) imcClass = "Obesidade";

    let fatPercent = "--";
    let fatClass = "Preencha cintura e pescoço";
    
    if (waist && neck) {
        if (gender === 'male') {
            fatPercent = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCm)) - 450;
        } else {
            fatPercent = 163.205 * Math.log10(waist + 0 - neck) - 97.684 * Math.log10(heightCm) - 78.387; // Simplificado para feminino
        }
        
        if (fatPercent !== "--" && !isNaN(fatPercent)) {
            fatPercent = fatPercent.toFixed(1);
            if (gender === 'male') {
                if (fatPercent < 6) fatClass = "Essencial";
                else if (fatPercent < 14) fatClass = "Atleta";
                else if (fatPercent < 18) fatClass = "Boa forma";
                else if (fatPercent < 25) fatClass = "Aceitável";
                else fatClass = "Elevada";
            } else {
                if (fatPercent < 14) fatClass = "Essencial";
                else if (fatPercent < 21) fatClass = "Atleta";
                else if (fatPercent < 25) fatClass = "Boa forma";
                else if (fatPercent < 31) fatClass = "Aceitável";
                else fatClass = "Elevada";
            }
        }
    }

    document.getElementById('res-imc').innerText = imc.toFixed(1);
    document.getElementById('res-imc-class').innerText = imcClass;
    document.getElementById('res-fat').innerText = fatPercent;
    document.getElementById('res-fat-class').innerText = fatClass;
    
    document.getElementById('imc-result').classList.remove('hidden');
    
    // Atualiza o peso no Dashboard
    loggedUser.weight = weight;
    localStorage.setItem('gympro_user', JSON.stringify(loggedUser));
    document.getElementById('user-weight').innerText = weight;
}

// --- ATUALIZAR DASHBOARD COM NOVO VISUAL ---
function renderDashboard() {
    document.getElementById('user-name').innerText = loggedUser.name || 'Atleta';
    
    // Atualiza Avatar
    const avatarDiv = document.getElementById('user-avatar');
    if (loggedUser.picture) {
        avatarDiv.innerHTML = `<img src="${loggedUser.picture}" alt="Foto">`;
    } else {
        avatarDiv.innerHTML = `<i class="fa-solid fa-user"></i>`;
    }

    // Atualiza Peso
    document.getElementById('user-weight').innerText = loggedUser.weight || '--';
    
    // Atualiza Treinos na Semana
    let treinosSemana = DB.history.filter(h => new Date(h.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    document.getElementById('weekly-progress').innerText = treinosSemana;

    document.getElementById('today-workout').innerText = DB.workouts.length > 0 ? `${DB.workouts[0].name} - ${DB.workouts[0].desc}` : "Nenhum treino criado";
    
    const resumeBtn = document.getElementById('resume-btn');
    if (activeWorkout && activeExerciseIndex < flatSets.length) {
        resumeBtn.style.display = 'flex';
    } else {
        resumeBtn.style.display = 'none';
    }

    // Gráfico de Peso (Mockado para o visual)
    initWeightChart();
}

let weightChart = null;
function initWeightChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    if (weightChart) weightChart.destroy();
    
    // Dados de exemplo (você pode integrar com o banco depois)
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Peso (kg)',
                data: [75, 74.8, 74.5, 74.5, 74.2, 74, 73.8],
                borderColor: '#b5c7eb',
                backgroundColor: 'rgba(181, 199, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#6b6e76' } } }
        }
    });
}