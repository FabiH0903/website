function loadPatient(id) {
  const list = JSON.parse(localStorage.getItem('patientRecords') || '[]');
  return list.find(p => p.id === id);
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('anamnesisContainer');
  const headerDisplay = document.getElementById('currentPatientDisplay');
  const id = parseInt(localStorage.getItem('currentPatientId'), 10);

  const patient = loadPatient(id);
  if (!patient) {
    headerDisplay.textContent = 'keiner ausgewählt';
    container.innerHTML = '<p>Kein Patient ausgewählt oder keine Anamnese vorhanden.</p>';
    return;
  }

  headerDisplay.textContent = `${patient.first} ${patient.last}`;

  const notes = patient.sections?.anamnesis || '';

  const section = document.createElement('div');
  section.className = 'patient-section';
  section.innerHTML = `
    <h3>${patient.first} ${patient.last}</h3>
    <p>${notes ? notes.replace(/\n/g, '<br>') : 'Keine Einträge.'}</p>
  `;
  container.appendChild(section);
});
