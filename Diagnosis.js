// dictation.js
let recognition;
let isRecording = false;

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

function updateUI() {
  document.getElementById('startBtn').disabled = isRecording;
  document.getElementById('stopBtn').disabled  = !isRecording;
}

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return document.getElementById('status').textContent = 'Kein Spracherkennungs‐API im Browser.';
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'de-DE';
  recognition.interimResults = false;
  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    const speaker = /ich|mir|mich/i.test(text) ? 'Patient' : 'Arzt';
    const line = `${speaker}: ${text}`;
    document.getElementById('transcript').value += line + '\n';
    const patient = getCurrentPatient();
    if (patient) {
      patient.sections = patient.sections || {};
      patient.sections.anamnesis = (patient.sections.anamnesis || '') + line + '\n';
      savePatient(patient);
    }
  };
  recognition.onerror = e => {
    document.getElementById('status').textContent = 'Fehler: ' + e.error;
  };
  recognition.onend = () => {
    isRecording = false;
    updateUI();
    document.getElementById('status').textContent = 'Aufnahme beendet.';
  };
  recognition.start();
  isRecording = true;
  updateUI();
  document.getElementById('status').textContent = 'Aufnahme läuft…';
}

document.getElementById('startBtn').addEventListener('click', () => {
  if (!isRecording) startRecognition();
});
document.getElementById('stopBtn').addEventListener('click', () => {
  if (recognition) recognition.stop();
});
