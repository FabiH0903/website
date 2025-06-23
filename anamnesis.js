// Beispiel-Daten für archivierte Patienten
const anamnesisData = {
  1: {
    name: 'Anna Musterfrau',
    points: [
      'Patientin berichtet über häufigen Durst und Harndrang seit 2 Monaten',
      'Erhöhte Müdigkeit und Gewichtsverlust von ca. 5 kg',
      'Diagnose: Neu diagnostizierter Diabetes Typ II',
      'Bisherige Maßnahmen: Blutzuckermessung durchgeführt, Ernährungsberatung eingeleitet',
    ]
  },
  2: {
    name: 'Max Mustermann',
    points: [
      'Patient klagt über wiederkehrende Atemnot bei Belastung',
      'Dokumentierte Asthmaanfälle in der Kindheit',
      'Aktuell: Inhalationstherapie mit Salbutamol',
      'Bisherige Maßnahmen: Lungenfunktionstest und Allergietest geplant',
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('anamnesisContainer');
  const headerDisplay = document.getElementById('currentPatientDisplay');
  // Ausgewählten Patienten aus LocalStorage holen
  const id = parseInt(localStorage.getItem('currentPatientId'), 10);

  if (!id || !anamnesisData[id]) {
    headerDisplay.textContent = 'keiner ausgewählt';
    container.innerHTML = '<p>Kein Patient ausgewählt oder keine Anamnese vorhanden.</p>';
    return;
  }

  const data = anamnesisData[id];
  // Header aktualisieren
  headerDisplay.textContent = data.name;

  // Anamnese anzeigen
  const section = document.createElement('div');
  section.className = 'patient-section';
  section.innerHTML = `
    <h3>${data.name}</h3>
    <ul>
      ${data.points.map(pt => `<li>${pt}</li>`).join('')}
    </ul>
  `;
  container.appendChild(section);
});