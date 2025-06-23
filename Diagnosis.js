const content = document.getElementById('content');
const archived = [
  {
    id: 1,
    name: 'Anna Musterfrau',
    date: '2025-06-15',
    analysis: {
      summary: 'Blutzuckerwerte stabil bei 110 mg/dL. Augenscreening empfohlen.',
      performed: ['Blutzucker-Kontrolle', 'Ernährungsberatung'],
      nextSteps: ['Augenarzt-Termin', 'Bewegungsprogramm']
    }
  },
  {
    id: 2,
    name: 'Max Mustermann',
    date: '2025-06-10',
    analysis: {
      summary: 'Asthma unter Kontrolle mit Salbutamol-Inhalator. Leichte Einschränkung beim Sport.',
      performed: ['Lungenfunktionstest', 'Allergietest'],
      nextSteps: ['Spirometrie in 3 Monaten', 'Inhalationstraining']
    }
  }
];

function renderAnalysis() {
  archived.forEach(p => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <h3>${p.name} (Archiviert: ${p.date})</h3>
      <p><strong>Kurzzusammenfassung:</strong> ${p.analysis.summary}</p>
      <p><strong>Durchgeführte Maßnahmen:</strong></p>
      <ul>${p.analysis.performed.map(item => `<li>${item}</li>`).join('')}</ul>
      <p><strong>Empfohlene nächste Schritte:</strong></p>
      <ul>${p.analysis.nextSteps.map(item => `<li>${item}</li>`).join('')}</ul>
    `;
    content.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', renderAnalysis);