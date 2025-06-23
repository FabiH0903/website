// anamnesis.js

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('anamnesisContainer');
  const id = parseInt(localStorage.getItem('currentPatientId'), 10);
  const patientList = JSON.parse(localStorage.getItem('patientRecords') || '[]');
  const patient = patientList.find(p => p.id === id);

  if (!patient) {
    container.innerHTML = '<p>Kein Patient ausgewählt.</p>';
    return;
  }

  // Header
  container.innerHTML = `<h3>${patient.first} ${patient.last}</h3>`;

  // Originales Transkript
  const notes = patient.sections?.anamnesis || '';
  const section = document.createElement('div');
  section.className = 'patient-section';
  section.innerHTML = `
    <h4>Anamnese-Protokoll</h4>
    <p>${notes.replace(/\n/g, '<br>') || '<em>Keine Einträge.</em>'}</p>
  `;
  container.appendChild(section);

  // KI-Zusammenfassung holen
  fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: notes })
  })
    .then(res => res.json())
    .then(json => {
      const summ = document.createElement('div');
      summ.className = 'patient-section';
      summ.innerHTML = `
        <h4>Kurzzusammenfassung</h4>
        <p>${json.summary}</p>
      `;
      container.appendChild(summ);
    })
    .catch(err => {
      console.error('Summary-Fehler:', err);
    });
});
