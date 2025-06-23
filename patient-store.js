const STORAGE_KEY = 'patientRecords';
let patientList = [];
let nextId = 1;

function ensureSectionFields(p) {
  p.sections = p.sections || {};
  const defaults = {
    anamnesis: '',
    diagnosis: '',
    treatment: '',
    review: '',
    export: '',
    analysisProtocol: '',
    diagnosisResults: '',
    treatmentPlan: '',
    diagnosisSummary: ''
  };
  for (const k in defaults) {
    if (!Object.prototype.hasOwnProperty.call(p.sections, k)) {
      p.sections[k] = defaults[k];
    }
  }
  return p;
}

function loadPatients() {
  const saved = localStorage.getItem(STORAGE_KEY);
  patientList = saved ? JSON.parse(saved) : [];
  patientList.forEach(ensureSectionFields);
  nextId = patientList.reduce((m, p) => Math.max(m, p.id), 0) + 1;
}

function savePatients() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patientList));
}

function addPatient(p) {
  p.id = nextId++;
  ensureSectionFields(p);
  p.archived = p.archived || false;
  patientList.push(p);
  savePatients();
  return p;
}

function updatePatient(p) {
  const idx = patientList.findIndex(x => x.id === p.id);
  if (idx !== -1) {
    patientList[idx] = ensureSectionFields(p);
    savePatients();
  }
}

function getPatientList() {
  return patientList.slice();
}

function setCurrentPatient(id) {
  localStorage.setItem('currentPatientId', id);
}

function getCurrentPatient() {
  const id = parseInt(localStorage.getItem('currentPatientId'), 10);
  return patientList.find(p => p.id === id);
}

// Initial load
loadPatients();

// expose globally
window.patientStore = {
  loadPatients,
  savePatients,
  addPatient,
  updatePatient,
  getPatientList,
  getCurrentPatient,
  setCurrentPatient
};

// for legacy callers
window.getCurrentPatient = getCurrentPatient;
window.savePatient = updatePatient;
