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

function startRecognition() {
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
    const lower = text.toLowerCase();
    const patientKeywords = ['ich', 'mir', 'mich'];
    const isPatient = patientKeywords.some(k => lower.includes(k));
    const speaker = isPatient ? 'Patient' : 'Arzt';
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
    if (isRecording) {
      startRecognition();
    } else {
      document.getElementById('status').textContent = 'Aufnahme beendet.';
    }
  };
  recognition.start();
  document.getElementById('status').textContent = 'Spracheingabe läuft...';
}

document.getElementById('startBtn').onclick = () => {
  if (isRecording) return;
  isRecording = true;
  startRecognition();
};

document.getElementById('stopBtn').onclick = () => {
  isRecording = false;
  if (recognition) recognition.stop();
};

