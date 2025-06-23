let recognition;

function getCurrentPatient() {
  const id = parseInt(localStorage.getItem('currentPatientId'), 10);
  const list = JSON.parse(localStorage.getItem('patientRecords') || '[]');
  return list.find(p => p.id === id);
}

function savePatient(patient) {
  const list = JSON.parse(localStorage.getItem('patientRecords') || '[]');
  const idx = list.findIndex(p => p.id === patient.id);
  if (idx !== -1) {
    list[idx] = patient;
    localStorage.setItem('patientRecords', JSON.stringify(list));
  }
}

document.getElementById('startBtn').onclick = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('status').textContent = 'Browser unterstützt keine Spracherkennung.';
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'de-DE';
  recognition.interimResults = false;
  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    const speaker = text.toLowerCase().includes('patient') ? 'Patient' : 'Arzt';
    const line = `${speaker}: ${text}`;
    const area = document.getElementById('transcript');
    area.value += line + '\n';

    const patient = getCurrentPatient();
    if (patient) {
      patient.sections = patient.sections || {};
      patient.sections.anamnesis = (patient.sections.anamnesis || '') + line + '\n';
      savePatient(patient);
    }
  };
  recognition.onerror = err => {
    document.getElementById('status').textContent = 'Fehler: ' + err.error;
  };
  recognition.onend = () => {
    document.getElementById('status').textContent = 'Aufnahme beendet.';
  };
  recognition.start();
  document.getElementById('status').textContent = 'Spracheingabe läuft...';
};

document.getElementById('stopBtn').onclick = () => {
  if (recognition) recognition.stop();
};

