const infoContainer = document.getElementById('infoContainer');
const patientLog = [
  { id: 1, first:'Anna', last:'Musterfrau', dob:'1975-05-12', city:'Hamburg', history:'Diabetes Typ II seit 2010', tests:'Blutzucker-Kontrolle: done\nAugenarzt: pending' },
  { id: 2, first:'Max', last:'Mustermann', dob:'1982-10-23', city:'Berlin', history:'Asthma bronchiale seit Kindheit', tests:'Lungenfunktionstest: done\nAllergietest: pending' }
];
let nextId = 3;

function showAddPatientForm() {
  document.getElementById('patientModal').style.display = 'flex';
}
function hideAddPatientForm() {
  document.getElementById('patientModal').style.display = 'none';
}

function addPatient() {
  const first   = document.getElementById('first').value;
  const last    = document.getElementById('last').value;
  const dob     = document.getElementById('dob').value;
  const city    = document.getElementById('city').value;
  const history = document.getElementById('history').value;
  const tests   = document.getElementById('tests').value;

  // Box anzeigen
  infoContainer.innerHTML = '';
  renderPatientBox({ first, last, dob, city, history, tests });

  // Log
  patientLog.push({ id: nextId++, first, last, dob, city, history, tests });
  hideAddPatientForm();
}

function addNoteBox() {
  const box = document.createElement('div');
  box.className = 'box';
  box.innerHTML = `
    <h3 contenteditable="true">Neue Notiz</h3>
    <p contenteditable="true">Notizinhalt...</p>
  `;
  infoContainer.appendChild(box);
}

function showArchivedModal() {
  const list = document.getElementById('archiveList');
  list.innerHTML = '';
  patientLog.forEach(p => {
    const li = document.createElement('li');
    li.style.padding = '8px';
    li.style.cursor = 'pointer';
    li.textContent = `${p.first} ${p.last}`;
    li.onclick = () => { hideArchiveModal(); renderPatientBox(p); };
    list.appendChild(li);
  });
  document.getElementById('archiveModal').style.display = 'flex';
}
function hideArchiveModal() {
  document.getElementById('archiveModal').style.display = 'none';
}

function renderPatientBox(p) {
  const box = document.createElement('div');
  box.className = 'box';
  box.innerHTML = `
    <h3>${p.first} ${p.last}</h3>
    <p><strong>Geburtsdatum:</strong> ${p.dob}</p>
    <p><strong>Wohnort:</strong> ${p.city}</p>
    <p><strong>Krankheitsgeschichte:</strong><br>${p.history.replace(/\n/g, '<br>')}</p>
    <p><strong>Untersuchungen:</strong><br>${p.tests.replace(/\n/g, '<br>')}</p>
  `;
  infoContainer.innerHTML = '';
  infoContainer.appendChild(box);
}