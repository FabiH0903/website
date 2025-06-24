// patient-store.js

const ALL_PATIENTS_STORAGE_KEY = 'allPatients';
const SELECTED_PATIENT_ID_STORAGE_KEY = 'selectedPatientId';
const ALL_TEMPLATES_STORAGE_KEY = 'allTemplates';

// Helper to generate a simple unique ID (more robust than slice(-6) but still not UUID)
// For a truly robust solution, consider a UUID library.
function generateUniqueId(prefix = '') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// Initialize with data from localStorage
let allPatients = JSON.parse(localStorage.getItem(ALL_PATIENTS_STORAGE_KEY)) || [];
let selectedPatientId = localStorage.getItem(SELECTED_PATIENT_ID_STORAGE_KEY) || null;
let allTemplates = JSON.parse(localStorage.getItem(ALL_TEMPLATES_STORAGE_KEY)) || [];

// Ensure selectedPatientId points to an existing patient, or clear it
if (selectedPatientId && !allPatients.some(p => p.id === selectedPatientId)) {
    selectedPatientId = null;
    localStorage.removeItem(SELECTED_PATIENT_ID_STORAGE_KEY);
}

const patientStore = {
    /**
     * Retrieves all stored patient objects (active and archived).
     * @returns {Array} An array of all patient objects.
     */
    getPatients: function() {
        return allPatients;
    },

    /**
     * Retrieves the currently selected patient object.
     * @returns {object|null} The current patient object or null if none is selected.
     */
    getCurrentPatient: function() {
        return allPatients.find(p => p.id === selectedPatientId) || null;
    },

    /**
     * Sets the currently selected patient by their ID.
     * @param {string|null} patientId - The ID of the patient to select, or null to deselect.
     */
    setCurrentPatient: function(patientId) {
        if (patientId === null) {
            selectedPatientId = null;
            localStorage.removeItem(SELECTED_PATIENT_ID_STORAGE_KEY);
            console.log("Current patient deselected.");
            return true;
        }
        if (allPatients.some(p => p.id === patientId)) {
            selectedPatientId = patientId;
            localStorage.setItem(SELECTED_PATIENT_ID_STORAGE_KEY, patientId);
            console.log(`Patient with ID ${patientId} selected.`);
            return true;
        }
        console.warn(`Patient with ID ${patientId} not found for selection.`);
        return false;
    },

    /**
     * Saves the current list of all patients and the selected patient ID to local storage.
     * Also saves templates.
     */
    saveAllData: function() {
        localStorage.setItem(ALL_PATIENTS_STORAGE_KEY, JSON.stringify(allPatients));
        localStorage.setItem(ALL_TEMPLATES_STORAGE_KEY, JSON.stringify(allTemplates));
        if (selectedPatientId) {
            localStorage.setItem(SELECTED_PATIENT_ID_STORAGE_KEY, selectedPatientId);
        } else {
            localStorage.removeItem(SELECTED_PATIENT_ID_STORAGE_KEY);
        }
        console.log("All patient and template data saved.");
    },

    /**
     * Adds a new patient to the store.
     * @param {object} patientData - Object containing new patient information.
     */
    addPatient: function(patientData) {
        if (!patientData.id) {
            patientData.id = generateUniqueId('PAT'); // Use a more robust ID generator
        }
        if (allPatients.some(p => p.id === patientData.id)) {
            console.warn(`Patient with ID ${patientData.id} already exists. Use updatePatient instead.`);
            return false;
        }
        // Ensure all default fields and sections exist for new patients
        const newPatient = {
            id: patientData.id,
            first: patientData.first || '',
            last: patientData.last || '',
            dob: patientData.dob || '',
            gender: patientData.gender || '',
            contact: patientData.contact || '',
            birthplace: patientData.birthplace || '',
            city: patientData.city || '',
            insurance: patientData.insurance || '',
            diagnosis: patientData.diagnosis || '',
            history: patientData.history || '',
            treatments: patientData.treatments || '',
            isArchived: patientData.isArchived || false,
            sections: {
                header: patientData.sections?.header || '',
                anamnesis: patientData.sections?.anamnesis || '',
                diagnosis: patientData.sections?.diagnosis || '',
                findings: patientData.sections?.findings || '',
                therapy: patientData.sections?.therapy || '', // Keep consistent with this name if used elsewhere
                prognosis: patientData.sections?.prognosis || '',
                closing: patientData.sections?.closing || '',
                notes: patientData.sections?.notes || '',
                // Ensure all expected sections are initialized here if they are used by the editor
            }
        };
        allPatients.push(newPatient);
        this.saveAllData();
        console.log("Patient added:", newPatient.id);
        return newPatient;
    },

    /**
     * Updates an existing patient in the store.
     * @param {object} updatedPatientData - Object containing updated patient information. Must include 'id'.
     */
    updatePatient: function(updatedPatientData) {
        const index = allPatients.findIndex(p => p.id === updatedPatientData.id);
        if (index !== -1) {
            // Merge existing data with updated data, especially for nested sections
            const existingPatient = allPatients[index];
            // Shallow merge for top-level properties
            Object.assign(existingPatient, updatedPatientData);
            // Deep merge for sections to preserve existing section content
            if (updatedPatientData.sections) {
                Object.assign(existingPatient.sections, updatedPatientData.sections);
            }
            this.saveAllData();
            console.log("Patient updated:", existingPatient.id);
            return existingPatient;
        }
        console.warn(`Patient with ID ${updatedPatientData.id} not found for update.`);
        return null;
    },

    /**
     * Deletes a patient by their ID.
     * @param {string} patientId - The ID of the patient to delete.
     * @returns {boolean} True if patient was deleted, false otherwise.
     */
    deletePatient: function(patientId) {
        const initialLength = allPatients.length;
        allPatients = allPatients.filter(p => p.id !== patientId);
        if (allPatients.length < initialLength) {
            if (selectedPatientId === patientId) {
                this.setCurrentPatient(null); // Deselect if the deleted one was selected
            }
            this.saveAllData();
            console.log(`Patient with ID ${patientId} deleted.`);
            return true;
        }
        console.warn(`Patient with ID ${patientId} not found for deletion.`);
        return false;
    },

    /**
     * Archives a patient by their ID. Sets isArchived to true.
     * @param {string} patientId - The ID of the patient to archive.
     * @returns {boolean} True if patient was archived, false otherwise.
     */
    archivePatient: function(patientId) {
        const patient = allPatients.find(p => p.id === patientId);
        if (patient) {
            patient.isArchived = true;
            this.saveAllData();
            if (selectedPatientId === patientId) {
                this.setCurrentPatient(null); // Deselect if the archived one was selected
            }
            console.log(`Patient with ID ${patientId} archived.`);
            return true;
        }
        console.warn(`Patient with ID ${patientId} not found for archiving.`);
        return false;
    },

    /**
     * Unarchives a patient by their ID. Sets isArchived to false.
     * @param {string} patientId - The ID of the patient to unarchive.
     * @returns {boolean} True if patient was unarchived, false otherwise.
     */
    unarchivePatient: function(patientId) {
        const patient = allPatients.find(p => p.id === patientId);
        if (patient) {
            patient.isArchived = false;
            this.saveAllData();
            console.log(`Patient with ID ${patientId} unarchived.`);
            return true;
        }
        console.warn(`Patient with ID ${patientId} not found for unarchiving.`);
        return false;
    },

    /**
     * Retrieves all stored template objects.
     * @returns {Array} An array of all template objects.
     */
    getTemplates: function() {
        return allTemplates;
    },

    /**
     * Adds a new template to the store.
     * @param {object} templateData - Object containing new template information.
     * Should have 'name' and 'sections' (e.g., { anamnesis: "...", diagnosis: "..." }).
     */
    addTemplate: function(templateData) {
        const newTemplate = {
            id: generateUniqueId('TPL'), // Use robust ID generator
            name: templateData.name || `Unnamed Template ${allTemplates.length + 1}`,
            sections: templateData.sections || {}
        };
        allTemplates.push(newTemplate);
        this.saveAllData();
        console.log("Template added:", newTemplate.id);
        return newTemplate;
    },

    /**
     * Deletes a template by its ID.
     * @param {string} templateId - The ID of the template to delete.
     * @returns {boolean} True if template was deleted, false otherwise.
     */
    deleteTemplate: function(templateId) {
        const initialLength = allTemplates.length;
        allTemplates = allTemplates.filter(t => t.id !== templateId);
        if (allTemplates.length < initialLength) {
            this.saveAllData();
            console.log(`Template with ID ${templateId} deleted.`);
            return true;
        }
        console.warn(`Template with ID ${templateId} not found for deletion.`);
        return false;
    },

    /**
     * Clears all patient and template data from storage managed by this store.
     * Use with caution.
     */
    clearAllData: function() {
        allPatients = [];
        allTemplates = [];
        selectedPatientId = null;
        localStorage.removeItem(ALL_PATIENTS_STORAGE_KEY); // Explicitly remove only managed keys
        localStorage.removeItem(SELECTED_PATIENT_ID_STORAGE_KEY); // Explicitly remove only managed keys
        localStorage.removeItem(ALL_TEMPLATES_STORAGE_KEY); // Explicitly remove only managed keys
        console.log("All patient and template data cleared.");
    }
};

// Expose patientStore to the global scope
window.patientStore = patientStore;

// --- Initial Data Population (for demonstration) ---
// This ensures there are always at least some patients and templates if localStorage is empty
if (patientStore.getPatients().length === 0 && patientStore.getTemplates().length === 0) {
    console.log("No patients or templates found. Populating with example data.");

    // Add example patients
    const patient1 = patientStore.addPatient({
        first: "Max",
        last: "Mustermann",
        dob: "2001-01-01",
        gender: "male",
        contact: "Musterweg 1, 12345 Musterstadt, 0123-456789, max@example.com",
        birthplace: "Musterstadt",
        city: "Musterstadt",
        insurance: "AOK",
        diagnosis: "Akute Tonsillitis",
        history: "Bekannte Allergien: Penicillin (Hautausschlag), Asthma bronchiale in der Kindheit.",
        treatments: "Stationäre Aufnahme am 20.06.2025 zur Antibiotikatherapie und symptomatischen Behandlung.",
        isArchived: false,
        sections: {
            anamnesis: 'Der Patient stellte sich mit Halsschmerzen, Fieber und Schluckbeschwerden vor. Beginn vor 3 Tagen.',
            diagnosis: 'Hauptdiagnose: Akute Tonsillitis (J03.9). Nebendiagnosen: Milde Dehydration (E86.0).',
            findings: 'Klinische Untersuchung: Rötung des Rachens, beidseitig vergrößerte Tonsillen mit eitrigem Exsudat. Lymphknotenschwellung zervikal. Labor: CRP 12 mg/L, Leukozyten 14.5 G/L.',
            therapy: 'Amoxicillin 875mg BID für 7 Tage, Paracetamol 500mg bei Bedarf. Empfehlung: Ausreichende Flüssigkeitszufuhr, warme Salbeigurgellösungen.',
            prognosis: 'Gute Prognose unter adäquater Therapie. Erwartete Genesung innerhalb von 5-7 Tagen. Bei Verschlechterung Wiedervorstellung.',
            closing: 'Mit freundlichen Grüßen, Dr. Mustermüller.',
            notes: 'Patient ist sehr kooperativ. Wichtig: Erinnern an vollständige Einnahme der Antibiotika.'
        }
    });

    const patient2 = patientStore.addPatient({
        first: "Sophie",
        last: "Müller",
        dob: "1985-03-15",
        gender: "female",
        contact: "Birkenweg 7, 54321 Waldstadt, 0987-654321, sophie@example.com",
        birthplace: "Waldstadt",
        city: "Waldstadt",
        insurance: "Barmer",
        diagnosis: "Akute Appendizitis",
        history: "Keine Vorerkrankungen. Keine bekannten Allergien. Raucherin (10 PY).",
        treatments: "Laproskopische Appendektomie am 18.06.2025. Postoperative Schmerztherapie.",
        isArchived: false,
        sections: {
            anamnesis: 'Plötzlich einsetzende Unterbauchschmerzen rechts, Übelkeit und Appetitlosigkeit seit 1 Tag.',
            diagnosis: 'Hauptdiagnose: Akute Appendizitis (K35.8).',
            findings: 'Klinische Untersuchung: Druckschmerz im rechten Unterbauch, Loslassschmerz. Labor: Leukozyten 18.2 G/L, CRP 85 mg/L. CT: Entzündete Appendix.',
            therapy: 'Postoperativ: Ibuprofen 400mg bei Bedarf. Empfehlung: Körperliche Schonung für 2 Wochen, Wundpflege.',
            prognosis: 'Nach komplikationslosem Verlauf gute Prognose. Wundheilung abwarten. Fädenzug in 10 Tagen.',
            closing: 'Mit freundlichen Grüßen, Dr. Chirurg.',
            notes: 'Patientin wurde über Verhaltensmaßnahmen nach OP aufgeklärt. Zustand stabil.'
        }
    });

    const patient3 = patientStore.addPatient({
        first: "Archivierte",
        last: "Patientin",
        dob: "1970-11-20",
        gender: "female",
        contact: "Archivweg 3, 00000 Archivstadt, 0000-000000",
        birthplace: "Archivstadt",
        city: "Archivstadt",
        insurance: "TKK",
        diagnosis: "Chronische Rückenschmerzen (archiviert)",
        history: "Langjährige Rückenschmerzen, konservativ behandelt.",
        treatments: "Diverse Physiotherapie und Schmerzmedikation in der Vergangenheit.",
        isArchived: true,
        sections: {
            anamnesis: 'Patientin leidet seit Jahren unter chronischen lumbalen Rückenschmerzen.',
            diagnosis: 'Chronische Lumboischialgie (M54.4).',
            findings: 'MRT LWS vom 01.01.2023 zeigt degenerative Veränderungen.',
            therapy: 'Regelmäßige Physiotherapie, Schmerzmittel bei Bedarf, Wärmeanwendungen.',
            prognosis: 'Chronischer Verlauf, Ziel ist Schmerzreduktion und Funktionsverbesserung.',
            closing: 'Mit freundlichen Grüßen, Dr. Archiv.',
            notes: 'Fall ist abgeschlossen und archiviert.'
        }
    });

    // Add example templates
    patientStore.addTemplate({
        name: "Standard Anamnese-Vorlage",
        sections: {
            anamnesis: `
                <b>Anamnese:</b>
                Der Patient/die Patientin [Name] stellte sich mit [Hauptbeschwerde] vor.
                Beginn der Symptome: [Datum/Zeitraum].
                Charakter der Symptome: [Beschreibung].
                Begleitsymptome: [Liste].

                <b>Vorerkrankungen:</b>
                <ul>
                    <li>[Vorerkrankung 1]</li>
                    <li>[Vorerkrankung 2]</li>
                </ul>

                <b>Medikation:</b>
                [Liste der aktuellen Medikamente]

                <b>Allergien:</b>
                [Liste der Allergien]

                <b>Sozialanamnese:</b>
                [Familienstand, Beruf, etc.]
            `,
            diagnosis: ``,
            therapy: ``, // Consistent naming
            notes: ``
        }
    });

    patientStore.addTemplate({
        name: "Post-OP Entlassungsbrief",
        sections: {
            diagnosis: `
                <b>Primäre Diagnose:</b> [Primärdiagnose ICD-10] nach [Operationsname] am [Datum der OP].
                <b>Sekundäre Diagnosen:</b> [Sekundärdiagnosen ICD-10]
            `,
            findings: `
                <b>Operationsbericht:</b>
                Datum: [Datum der OP]
                Operation: [Operationsname]
                Operateur: [Name Operateur]
                Anästhesie: [Art der Anästhesie]
                Befund: [Kurzer Operationsbefund]
                Komplikationen: [Ja/Nein, wenn ja: Beschreibung]
            `,
            therapy: `
                <b>Postoperative Medikation:</b>
                <ul>
                    <li>Schmerzmittel: [Medikament, Dosis, Frequenz]</li>
                    <li>Antibiotika: [Medikament, Dosis, Frequenz, Dauer]</li>
                </ul>
                <b>Empfehlungen für Zuhause:</b>
                <ul>
                    <li>Körperliche Schonung für [Zeitraum].</li>
                    <li>Keine schweren Lasten heben für [Zeitraum].</li>
                    <li>Wundpflege: [Anleitung].</li>
                    <li>Fädenzug am [Datum] bei [Arzt/Ort].</li>
                </ul>
            `,
            prognosis: `
                Der postoperative Verlauf war [unauffällig/komplikationslos/etc.].
                Die Prognose ist [gut/vorsichtig].
                Regelmäßige Kontrollen sind wichtig. Bei Schwellung, Rötung, Fieber oder starken Schmerzen bitte umgehend Kontakt aufnehmen.
            `,
            notes: "Dies ist eine Vorlage für postoperative Notizen."
        }
    });

    // Select the first active patient by default after populating
    const activePatients = patientStore.getPatients().filter(p => !p.isArchived);
    if (activePatients.length > 0) {
        patientStore.setCurrentPatient(activePatients[0].id);
    }
} else {
    console.log("Patients and/or templates found in storage.");
}