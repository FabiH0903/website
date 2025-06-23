// dictation.js

document.addEventListener('DOMContentLoaded', () => {
  let recognition;
  let isRecording = false;
  const startBtn = document.getElementById('startBtn');
  const stopBtn  = document.getElementById('stopBtn');
  const status   = document.getElementById('status');
  const area     = document.getElementById('transcript');

  function updateUI() {
    startBtn.disabled = isRecording;
    stopBtn.disabled  = !isRecording;
  }

  function startRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      status.textContent = 'Browser unterstützt keine Spracherkennung.';
      return;
    }
    recognition = new SR();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;

    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      const isPatient = /ich|mir|mich/i.test(text);
      const line = `${isPatient ? 'Patient' : 'Arzt'}: ${text}`;
      area.value += line + '\n';

      // Speichern in patient.sections.anamnesis
      const patient = getCurrentPatient();
      if (patient) {
        patient.sections = patient.sections || {};
        patient.sections.anamnesis = (patient.sections.anamnesis || '') + line + '\n';
        savePatient(patient);
      }
    };

    recognition.onerror = e => { status.textContent = 'Fehler: ' + e.error; };
    recognition.onend   = () => {
      isRecording = false;
      updateUI();
      status.textContent = 'Aufnahme beendet.';
    };

    recognition.start();
    isRecording = true;
    updateUI();
    status.textContent = 'Spracheingabe läuft…';
  }

  startBtn.addEventListener('click', () => { if (!isRecording) startRecognition(); });
  stopBtn.addEventListener('click', () => { if (recognition) recognition.stop(); });

  // Initial UI-State
  updateUI();
  status.textContent = 'Bereit.';
});

// Hilfsfunktionen (aus common.js oder dictation-spezifisch)
function getCurrentPatient() {
  const id = parseInt(localStorage.getItem('currentPatientId'), 10);
  const list = JSON.parse(localStorage.getItem('patientRecords') || '[]');
  return list.find(p => p.id === id);
}

function savePatient(p) {
  const list = JSON.parse(localStorage.getItem('patientRecords') || '[]');
  const idx = list.findIndex(x => x.id === p.id);
  if (idx !== -1) {
    list[idx] = p;
    localStorage.setItem('patientRecords', JSON.stringify(list));
  }
}
