// general-info.js

// Template-Modelle (nicht in localStorage)
const templates = [
  { first: 'Anna', last: 'Musterfrau', dob: '1980-01-01', birthplace: 'Berlin', city: 'Berlin', insurance: 'AOK', history: 'Allergie gegen Nüsse\nKopfschmerzen', treatments: 'Physio: 5 Sitzungen', progress: 40 },
  { first: 'Max',  last: 'Mustermann', dob: '1975-05-15', birthplace: 'Hamburg', city: 'Hamburg', insurance: 'TK',  history: 'Raucher\nRückenschmerzen', treatments: 'Röntgen Wirbelsäule', progress: 70 }
];

let patientLog = [];
let nextId = 1;

// Lädt aus localStorage oder initialisiert leere Liste
function loadPatients() {
  const saved = localStorage.getItem('patientRecords');
  if (saved) {
    patientLog = JSON.parse(saved);
    nextId = patientLog.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  } else {
    patientLog = [];
    savePatients();
  }
}

// Speichert in localStorage
function savePatients() {
  localStorage.setItem('patientRecords', JSON.stringify(patientLog));
}

// Klont ein Template als neuen Patienten und zeigt ihn an
function selectTemplate(tpl) {
  const p = {
    id: nextId++,
    ...tpl,
    archived: false,
    sections: { anamnesis: '', diagnosis: '', treatment: '', review: '', export: '' }
  };
  patientLog.push(p);
  savePatients();
  localStorage.setItem('currentPatientId', p.id);
  renderGeneralInfo(p);
  hideArchiveModal();
}

// Zeigt einen existierenden Patienten
function selectPatient(p) {
  localStorage.setItem('currentPatientId', p.id);
  renderGeneralInfo(p);
  hideArchiveModal();
}

// Baut die vier Boxen für den Patienten
function renderGeneralInfo(p) {
  const c = document.getElementById('generalInfoContainer');
  c.innerHTML = `
    <div class="info-container">
      <div class="info-box personal">
        <h3>Persönliche Daten</h3>
        <p><strong>Name:</strong> ${p.first} ${p.last}</p>
        <p><strong>Geburtsdatum:</strong> ${p.dob}</p>
        <p><strong>Geburtsort:</strong> ${p.birthplace}</p>
        <p><strong>Stadt:</strong> ${p.city}</p>
        <p><strong>Krankenkasse:</strong> ${p.insurance}</p>
      </div>
      <div class="info-box">
        <h3>Aktuelles Krankheitsbild</h3>
        <p>${p.history.replace(/\n/g,'<br>')}</p>
      </div>
      <div class="info-box">
        <h3>Durchgeführte Behandlungen</h3>
        <p>${p.treatments.replace(/\n/g,'<br>')}</p>
      </div>
      <div class="info-box">
        <h3>Fortschritt Arztbrief</h3>
        <div class="progress-bar"><div class="progress" style="width:${p.progress}%"></div></div>
        <p>${p.progress}% abgeschlossen</p>
      </div>
    </div>
  `;
}

// Modal: Vorlagen & Archiv
function showArchiveModal() {
  const tplList = document.getElementById('templateList');
  const archList = document.getElementById('archiveList');
  tplList.innerHTML = '';
  templates.forEach(tpl => {
    const li = document.createElement('li');
    li.textContent = `${tpl.first} ${tpl.last}`;
    li.onclick = () => selectTemplate(tpl);
    tplList.appendChild(li);
  });
  archList.innerHTML = '';
  patientLog.filter(p => p.archived).forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.first} ${p.last}`;
    li.onclick = () => selectPatient(p);
    archList.appendChild(li);
  });
  document.getElementById('archiveModal').style.display = 'flex';
}
function hideArchiveModal() {
  document.getElementById('archiveModal').style.display = 'none';
}

// Modal: Neuer Patient
function showNewPatientModal() {
  document.getElementById('newPatientModal').style.display = 'flex';
}
function hideNewPatientModal() {
  document.getElementById('newPatientModal').style.display = 'none';
}

// Verarbeitung des Formulars
function handleNewPatientSubmit(e) {

  const f = e.target;
  const p = {
    id: nextId++,
    first: f.first.value.trim(),
    last: f.last.value.trim(),
    dob: f.dob.value,
    birthplace: f.birthplace.value.trim(),
    city: f.city.value.trim(),
    insurance: f.insurance.value.trim(),
    history: f.history.value.trim(),
    treatments: f.treatments.value.trim(),
    progress: 0,
    archived: false,
    sections: { anamnesis: '', diagnosis: '', treatment: '', review: '', export: '' }
  };

  patientLog.push(p);
  savePatients();
  localStorage.setItem('currentPatientId', p.id);
  renderGeneralInfo(p);
  
}

// Archiviert aktuellen Patienten
function archiveCurrentPatient() {
  const id = +localStorage.getItem('currentPatientId');
  const p = patientLog.find(x => x.id === id);
  if (!p) return alert('Kein Patient ausgewählt.');
  p.archived = true;
  savePatients();
  document.getElementById('generalInfoContainer').innerHTML = '<p>Kein Patient ausgewählt.</p>';
  localStorage.removeItem('currentPatientId');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadPatients();
  document.getElementById('newPatientForm')
          .addEventListener('submit', handleNewPatientSubmit);
  const saved = localStorage.getItem('currentPatientId');
  if (saved) {
    const p = patientLog.find(x => x.id === +saved);
    if (p) renderGeneralInfo(p);
  }
});
