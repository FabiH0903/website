// patientStore.js

// This object will hold all the state and methods for managing patients
const patientStore = (() => { // Using an IIFE (Immediately Invoked Function Expression) for encapsulation
    const STORAGE_KEY = 'patientRecords';
    let patientList = []; // This is now private to the patientStore IIFE
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
        nextId = patientList.reduce((m, p) => Math.max(m, p.id || 0), 0) + 1; // Handle cases where id might be missing or 0
    }

    function savePatients() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patientList));
    }

    function addPatient(p) {
        p.id = nextId++;
        ensureSectionFields(p);
        p.archived = p.archived || false;
        patientList.push(p);
        savePatients(); // Ensures the new patient is written to localStorage
        return p;
    }

    function updatePatient(p) {
        const idx = patientList.findIndex(x => x.id === p.id);
        if (idx !== -1) {
            patientList[idx] = ensureSectionFields(p);
            savePatients(); // Ensures updates are written to localStorage
        }
    }

    function getPatientList() {
        return patientList.slice(); // Return a copy to prevent external modification
    }

    function setCurrentPatient(id) {
        localStorage.setItem('currentPatientId', id);
    }

    function getCurrentPatient() {
        const id = parseInt(localStorage.getItem('currentPatientId'), 10);
        return patientList.find(p => p.id === id);
    }

    // Initial load when the script runs
    loadPatients();

    // Expose the public interface of the patient store
    return {
        loadPatients,
        savePatients,
        addPatient,
        updatePatient,
        getPatientList,
        getCurrentPatient,
        setCurrentPatient
    };
})(); // The IIFE executes immediately

// Expose globally (assuming you don't use ES6 modules yet)
window.patientStore = patientStore;

// for legacy callers (if needed)
window.getCurrentPatient = patientStore.getCurrentPatient;
window.savePatient = patientStore.updatePatient;