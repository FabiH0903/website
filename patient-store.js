// patient-store.js

const PATIENTS_STORAGE_KEY = 'medical_patients';
const CURRENT_PATIENT_KEY = 'current_patient_id';
const TEMPLATES_STORAGE_KEY = 'medical_templates'; // NEU: Schlüssel für Vorlagen

class PatientStore {
    constructor() {
        this.patients = this.loadPatients();
        this.currentPatientId = this.loadCurrentPatientId();
        this.templates = this.loadTemplates(); // NEU: Vorlagen laden
        this.initializeDefaultTemplates(); // NEU: Standardvorlagen initialisieren
    }

    loadPatients() {
        const patientsJson = localStorage.getItem(PATIENTS_STORAGE_KEY);
        return patientsJson ? JSON.parse(patientsJson) : [];
    }

    savePatients() {
        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(this.patients));
    }

    loadTemplates() { // NEU
        const templatesJson = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        return templatesJson ? JSON.parse(templatesJson) : [];
    }

    saveTemplates() { // NEU
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(this.templates));
    }

    initializeDefaultTemplates() { // NEU: Funktion zum Hinzufügen von Beispiel-Vorlagen
        if (this.templates.length === 0) {
            this.addTemplate({
                id: 'TPL-101',
                name: 'Allgemeine Anamnese',
                sections: {
                    anamnesis: 'Patient kommt mit Symptomen wie [Symptom 1] und [Symptom 2]. Beginn vor [X] Tagen/Wochen. Vorerkrankungen: [Liste der Vorerkrankungen]. Medikamente: [Liste der Medikamente]. Allergien: [Liste der Allergien]. Familienanamnese: [Familienanamnese Details]. Sozialanamnese: [Sozialanamnese Details].',
                    diagnosis: '',
                    treatmentPlan: '',
                    letterDraft: '',
                    notes: 'Diese Vorlage ist für eine allgemeine Erstanamnese.'
                }
            });
            this.addTemplate({
                id: 'TPL-102',
                name: 'Standard-Behandlungsplan',
                sections: {
                    anamnesis: '',
                    diagnosis: 'Diagnose: [Diagnose Code/Text]',
                    treatmentPlan: 'Behandlungsziele: [Ziel 1], [Ziel 2]. Therapie: [Medikament/Therapie 1] [Dosierung] [Frequenz], [Medikament/Therapie 2] [Dosierung] [Frequenz]. Nächste Kontrolle in [X] Wochen/Monaten.',
                    letterDraft: '',
                    notes: 'Standardplan für häufige Erkrankungen.'
                }
            });
            // Füge hier weitere Beispiel-Vorlagen hinzu
            this.saveTemplates();
        }
    }

    addTemplate(template) { // NEU
        this.templates.push(template);
        this.saveTemplates();
    }

    getTemplates() { // NEU
        return this.templates;
    }

    getTemplateById(id) { // NEU
        return this.templates.find(t => t.id === id);
    }

    loadCurrentPatientId() {
        return localStorage.getItem(CURRENT_PATIENT_KEY);
    }

    saveCurrentPatientId(id) {
        if (id === null) {
            localStorage.removeItem(CURRENT_PATIENT_KEY);
        } else {
            localStorage.setItem(CURRENT_PATIENT_KEY, id);
        }
    }

    getPatients() {
        return this.patients;
    }

    addPatient(patient) {
        // Sicherstellen, dass alle Sektionen und neuen Felder initialisiert sind
        if (!patient.sections) {
            patient.sections = {
                anamnesis: '',
                diagnosis: '',
                treatmentPlan: '',
                letterDraft: '',
                notes: '' // Neue Sektion für Notizen
            };
        } else {
            // Stelle sicher, dass "notes" auch bei bestehenden Patienten-Objekten hinzugefügt wird
            if (patient.sections.notes === undefined) {
                patient.sections.notes = '';
            }
        }
        // Initialisiere neue allgemeine Felder, falls nicht vorhanden
        patient.birthplace = patient.birthplace || '';
        patient.city = patient.city || '';
        patient.insurance = patient.insurance || '';
        patient.history = patient.history || '';
        patient.treatments = patient.treatments || '';
        patient.isArchived = patient.isArchived || false; // Standardmäßig nicht archiviert

        this.patients.push(patient);
        this.savePatients();
    }

    updatePatient(updatedPatient) {
        const index = this.patients.findIndex(p => p.id === updatedPatient.id);
        if (index !== -1) {
            this.patients[index] = updatedPatient;
            this.savePatients();
        }
    }

    getPatientById(id) {
        return this.patients.find(p => p.id === id);
    }

    getCurrentPatient() {
        if (this.currentPatientId) {
            const patient = this.getPatientById(this.currentPatientId);
            if (!patient) {
                this.setCurrentPatient(null);
                return null;
            }
            // Sicherstellen, dass die "notes"-Sektion immer vorhanden ist, auch bei alten Daten
            if (!patient.sections.notes) {
                patient.sections.notes = '';
            }
            return patient;
        }
        return null;
    }

    setCurrentPatient(id) {
        this.currentPatientId = id;
        this.saveCurrentPatientId(id);
    }

    deletePatient(id) {
        const initialLength = this.patients.length;
        this.patients = this.patients.filter(p => p.id !== id);
        if (this.patients.length < initialLength) {
            this.savePatients();
            if (this.currentPatientId === id) {
                this.setCurrentPatient(null);
            }
            return true;
        }
        return false;
    }

    // NEU: Patient archivieren
    archivePatient(id) {
        const patient = this.getPatientById(id);
        if (patient) {
            patient.isArchived = true;
            this.updatePatient(patient);
            return true;
        }
        return false;
    }

    // NEU: Patient wiederherstellen (entarchivieren)
    unarchivePatient(id) {
        const patient = this.getPatientById(id);
        if (patient) {
            patient.isArchived = false;
            this.updatePatient(patient);
            return true;
        }
        return false;
    }
}

// Erstelle eine globale Instanz des PatientStore
const patientStore = new PatientStore();