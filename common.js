// common.js
function getCurrentPatient() {
  const id = parseInt(localStorage.getItem('currentPatientId'), 10);
  const list = JSON.parse(localStorage.getItem('patientRecords') || '[]');
  return list.find(p => p.id === id);
}

/**
 * Rendert die Sektion aus patient.sections[sectionKey] in das Element containerId.
 */
function renderPatientSection(sectionKey, containerId) {
  const patient = getCurrentPatient();
  const container = document.getElementById(containerId);
  if (!patient || !container) {
    container.innerHTML = '<p>Kein Patient ausgewählt oder keine Daten vorhanden.</p>';
    return;
  }
  const content = patient.sections[sectionKey] || '';
  container.innerHTML = `
    <div class="patient-header">Aktueller Patient: <strong>${patient.first} ${patient.last}</strong></div>
    <div class="patient-section">
      ${content.replace(/\n/g, '<br>') || '<em>Keine Einträge.</em>'}
    </div>
  `;
}
