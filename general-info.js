// general-info.js

let currentPatientId = null; // Speichert die ID des aktuell angezeigten Patienten

function initGeneralInfoPage() {
    console.log("initGeneralInfoPage called for combined version.");

    // --- HTML-Elemente abrufen ---
    const patientNameElem = document.getElementById('patientName');
    const patientDobElem = document.getElementById('patientDob');
    const patientGenderElem = document.getElementById('patientGender');
    const patientContactElem = document.getElementById('patientContact');
    const patientDiagnosisElem = document.getElementById('patientDiagnosis');
    const patientIdElem = document.getElementById('patientId');
    const patientBirthplaceElem = document.getElementById('patientBirthplace');
    const patientCityElem = document.getElementById('patientCity');
    const patientInsuranceElem = document.getElementById('patientInsurance');
    const patientHistoryElem = document.getElementById('patientHistory');
    const patientTreatmentsElem = document.getElementById('patientTreatments');

    const progressBarElem = document.getElementById('progressBar');
    const progressPercentageElem = document.getElementById('progressPercentage');
    const nextStepElem = document.getElementById('nextStep');

    const selectPatientBtn = document.getElementById('selectPatientBtn');
    const clearPatientSelectionBtn = document.getElementById('clearPatientSelectionBtn');
    const deletePatientBtn = document.getElementById('deletePatientBtn');

    // Toolbar Buttons
    const toolbarNewPatientBtn = document.getElementById('toolbarNewPatientBtn');
    const addNoteBoxBtn = document.getElementById('addNoteBoxBtn');
    const toolbarShowArchiveModalBtn = document.getElementById('toolbarShowArchiveModalBtn');
    const archiveCurrentPatientBtn = document.getElementById('archiveCurrentPatientBtn');

    // Modals
    const patientSelectionModal = document.getElementById('patientSelectionModal');
    const closePatientSelectionModalBtn = document.getElementById('closePatientSelectionModal');
    const patientList = document.getElementById('patientList');
    const patientSearchInput = document.getElementById('patientSearchInput');

    const newPatientModal = document.getElementById('newPatientModal');
    const closeNewPatientModalBtn = document.getElementById('closeNewPatientModal');
    const newPatientForm = document.getElementById('newPatientForm');
    const cancelNewPatientBtn = document.getElementById('cancelNewPatientBtn');

    const archiveModal = document.getElementById('archiveModal');
    const closeArchiveModalBtn = document.getElementById('closeArchiveModal');
    const archiveModalCloseBtn = document.getElementById('archiveModalCloseBtn');
    const archiveList = document.getElementById('archiveList');
    const templateList = document.getElementById('templateList'); // NEU: Template Liste


    // Notizen Elemente
    const patientNotesContentElem = document.getElementById('patientNotesContent');
    const savePatientNotesBtn = document.getElementById('savePatientNotesBtn');


    // --- Funktionen ---

    // Funktion zum Aktualisieren der Patienten-Anzeige
    function updatePatientDisplay() {
        const patient = patientStore.getCurrentPatient();
        if (patient) {
            patientNameElem.textContent = `${patient.first} ${patient.last}`;
            patientDobElem.textContent = patient.dob;
            patientGenderElem.textContent = patient.gender;
            patientContactElem.textContent = patient.contact;
            patientDiagnosisElem.textContent = patient.diagnosis;
            patientIdElem.textContent = patient.id;
            patientBirthplaceElem.textContent = patient.birthplace || 'N/A';
            patientCityElem.textContent = patient.city || 'N/A';
            patientInsuranceElem.textContent = patient.insurance || 'N/A';
            patientHistoryElem.textContent = patient.history || 'N/A';
            patientTreatmentsElem.textContent = patient.treatments || 'N/A';

            patientNotesContentElem.value = patient.sections.notes || '';
            patientNotesContentElem.disabled = false;
            savePatientNotesBtn.disabled = false;

            currentPatientId = patient.id;

            selectPatientBtn.style.display = 'inline-block';
            clearPatientSelectionBtn.style.display = 'inline-block';
            deletePatientBtn.style.display = 'inline-block';
            archiveCurrentPatientBtn.disabled = false;

            updateProgressBar(patient);
        } else {
            patientNameElem.textContent = "Bitte Patient auswählen";
            patientDobElem.textContent = "";
            patientGenderElem.textContent = "";
            patientContactElem.textContent = "";
            patientDiagnosisElem.textContent = "";
            patientIdElem.textContent = "";
            patientBirthplaceElem.textContent = "";
            patientCityElem.textContent = "";
            patientInsuranceElem.textContent = "";
            patientHistoryElem.textContent = "";
            patientTreatmentsElem.textContent = "";

            patientNotesContentElem.value = "Kein Patient ausgewählt. Notizen nicht verfügbar.";
            patientNotesContentElem.disabled = true;
            savePatientNotesBtn.disabled = true;

            currentPatientId = null;

            clearPatientSelectionBtn.style.display = 'none';
            deletePatientBtn.style.display = 'none';
            archiveCurrentPatientBtn.disabled = true;

            updateProgressBar(null);
        }
    }

    // Funktion zum Aktualisieren des Fortschrittsbalkens
    function updateProgressBar(patient) {
        let completedSections = 0;
        const totalSections = 6;

        if (patient) {
            if (patient.first && patient.last && patient.dob && patient.gender && patient.contact &&
                patient.diagnosis && patient.birthplace && patient.city && patient.insurance &&
                patient.history && patient.treatments) {
                completedSections++;
            }
            if (patient.sections.anamnesis && patient.sections.anamnesis.trim() !== '') {
                completedSections++;
            }
            if (patient.sections.diagnosis && patient.sections.diagnosis.trim() !== '') {
                completedSections++;
            }
            if (patient.sections.treatmentPlan && patient.sections.treatmentPlan.trim() !== '') {
                completedSections++;
            }
            if (patient.sections.letterDraft && patient.sections.letterDraft.trim() !== '') {
                completedSections++;
            }
            if (patient.sections.notes && patient.sections.notes.trim() !== '') {
                completedSections++;
            }
        }

        const percentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
        progressBarElem.style.width = `${percentage}%`;
        progressPercentageElem.textContent = `${percentage}%`;

        if (percentage < 10) {
            nextStepElem.textContent = "Patientendaten vervollständigen";
        } else if (percentage < 30) {
            nextStepElem.textContent = "Anamnese erfassen";
        } else if (percentage < 50) {
            nextStepElem.textContent = "Diagnose erstellen";
        } else if (percentage < 70) {
            nextStepElem.textContent = "Behandlungsplan erstellen";
        } else if (percentage < 90) {
            nextStepElem.textContent = "Entlassbriefentwurf überprüfen";
        } else if (percentage < 100) {
            nextStepElem.textContent = "Zusätzliche Notizen hinzufügen";
        } else {
            nextStepElem.textContent = "Behandlung abgeschlossen. Zum Export bereit!";
        }
    }

    // Funktion zum Füllen der Patientenliste im Auswahl-Modal
    function populatePatientList(filterText = '') {
        patientList.innerHTML = '';
        const patients = patientStore.getPatients().filter(p => !p.isArchived); // Zeige nur aktive Patienten
        const filteredPatients = patients.filter(p =>
            p.first.toLowerCase().includes(filterText.toLowerCase()) ||
            p.last.toLowerCase().includes(filterText.toLowerCase()) ||
            p.id.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredPatients.length === 0) {
            const li = document.createElement('li');
            li.textContent = "Keine aktiven Patienten gefunden.";
            patientList.appendChild(li);
        } else {
            filteredPatients.forEach(patient => {
                const li = document.createElement('li');
                li.textContent = `${patient.first} ${patient.last} (ID: ${patient.id})`;
                li.onclick = () => {
                    patientStore.setCurrentPatient(patient.id);
                    updatePatientDisplay();
                    patientSelectionModal.style.display = 'none';
                };
                patientList.appendChild(li);
            });
        }
    }

    // Funktion zum Füllen der Archivliste im Archiv-Modal
    function populateArchiveList() {
        archiveList.innerHTML = '';
        const archivedPatients = patientStore.getPatients().filter(p => p.isArchived);

        if (archivedPatients.length === 0) {
            const li = document.createElement('li');
            li.textContent = "Keine archivierten Patienten gefunden.";
            archiveList.appendChild(li);
        } else {
            archivedPatients.forEach(patient => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${patient.first} ${patient.last} (ID: ${patient.id})
                    <button data-patient-id="${patient.id}" class="unarchive-btn" style="background-color: #007bff; float: right; margin-left: 10px; padding: 5px 8px; font-size: 0.8em;">Wiederherstellen</button>
                `;
                archiveList.appendChild(li);
            });

            // Event Listener für Wiederherstellen-Buttons
            archiveList.querySelectorAll('.unarchive-btn').forEach(button => {
                button.onclick = (event) => {
                    const patientIdToUnarchive = event.target.dataset.patientId;
                    if (confirm(`Möchten Sie Patient mit ID ${patientIdToUnarchive} wirklich wiederherstellen?`)) {
                        patientStore.unarchivePatient(patientIdToUnarchive);
                        alert('Patient erfolgreich wiederhergestellt!');
                        populatePatientList();
                        populateArchiveList();
                        patientStore.setCurrentPatient(patientIdToUnarchive);
                        updatePatientDisplay();
                        archiveModal.style.display = 'none';
                    }
                };
            });
        }
    }

    // NEU: Funktion zum Füllen der Vorlagenliste
    function populateTemplateList() {
        templateList.innerHTML = ''; // Liste leeren
        const templates = patientStore.getTemplates();

        if (templates.length === 0) {
            const li = document.createElement('li');
            li.textContent = "Keine Vorlagen gefunden.";
            templateList.appendChild(li);
        } else {
            templates.forEach(template => {
                const li = document.createElement('li');
                li.textContent = `${template.name} (ID: ${template.id})`;
                li.onclick = () => {
                    if (currentPatientId) {
                        const patient = patientStore.getCurrentPatient();
                        if (patient && confirm(`Möchten Sie die Vorlage "${template.name}" auf den aktuellen Patienten anwenden? Dies überschreibt bestehende Inhalte in den entsprechenden Sektionen!`)) {
                            // Übertrage nur die gefüllten Sektionen der Vorlage
                            for (const sectionKey in template.sections) {
                                if (template.sections[sectionKey] && template.sections[sectionKey].trim() !== '') {
                                    patient.sections[sectionKey] = template.sections[sectionKey];
                                }
                            }
                            patientStore.updatePatient(patient); // Patienten aktualisieren
                            updatePatientDisplay(); // Anzeige aktualisieren
                            archiveModal.style.display = 'none'; // Modal schließen
                            alert(`Vorlage "${template.name}" erfolgreich angewendet!`);
                        }
                    } else {
                        alert('Bitte wählen Sie zuerst einen Patienten aus, um eine Vorlage anzuwenden.');
                    }
                };
                templateList.appendChild(li);
            });
        }
    }


    // --- Event Listener ---

    // Patientenauswahl-Modal öffnen
    selectPatientBtn.onclick = () => {
        populatePatientList();
        patientSelectionModal.style.display = 'flex';
    };

    // Patientenauswahl-Modal schließen
    closePatientSelectionModalBtn.onclick = () => {
        patientSelectionModal.style.display = 'none';
    };

    // Patient abwählen
    clearPatientSelectionBtn.onclick = () => {
        patientStore.setCurrentPatient(null);
        updatePatientDisplay();
        alert('Aktueller Patient abgewählt.');
    };

    // Patient löschen
    deletePatientBtn.onclick = () => {
        if (currentPatientId && confirm(`Möchten Sie Patient mit ID ${currentPatientId} wirklich unwiderruflich löschen?`)) {
            patientStore.deletePatient(currentPatientId);
            patientStore.setCurrentPatient(null);
            updatePatientDisplay();
            alert('Patient erfolgreich gelöscht.');
        }
    };

    // Neuen Patienten anlegen Button (Toolbar)
    toolbarNewPatientBtn.onclick = () => {
        newPatientForm.reset();
        newPatientModal.style.display = 'flex';
    };

    // Modal für neuen Patienten schließen (X-Button)
    closeNewPatientModalBtn.onclick = () => {
        newPatientModal.style.display = 'none';
    };

    // Modal für neuen Patienten schließen (Abbrechen-Button)
    cancelNewPatientBtn.onclick = () => {
        newPatientModal.style.display = 'none';
    };

    // Formular für neuen Patienten absenden
    newPatientForm.onsubmit = (event) => {
        event.preventDefault();

        const newPatient = {
            id: 'PAT-' + Date.now().toString().slice(-6),
            first: document.getElementById('newFirstName').value,
            last: document.getElementById('newLastName').value,
            dob: document.getElementById('newDob').value,
            gender: document.getElementById('newGender').value,
            contact: document.getElementById('newContact').value,
            birthplace: document.getElementById('newBirthplace').value,
            city: document.getElementById('newCity').value,
            insurance: document.getElementById('newInsurance').value,
            diagnosis: document.getElementById('newDiagnosis').value,
            history: document.getElementById('newHistory').value,
            treatments: document.getElementById('newTreatments').value,
            isArchived: false,
            sections: {
                anamnesis: '',
                diagnosis: '',
                treatmentPlan: '',
                letterDraft: '',
                notes: '',
            }
        };

        patientStore.addPatient(newPatient);
        patientStore.setCurrentPatient(newPatient.id);
        updatePatientDisplay();
        newPatientModal.style.display = 'none';
        alert('Neuer Patient erfolgreich angelegt und ausgewählt!');
    };

    // Archiv-Modal öffnen (angepasst für Vorlagen)
    toolbarShowArchiveModalBtn.onclick = () => {
        populateArchiveList();
        populateTemplateList(); // NEU: Vorlagenliste füllen
        archiveModal.style.display = 'flex';
    };

    // Archiv-Modal schließen (X-Button)
    closeArchiveModalBtn.onclick = () => { archiveModal.style.display = 'none'; };
    // Archiv-Modal schließen (Schließen-Button im Modal)
    archiveModalCloseBtn.onclick = () => { archiveModal.style.display = 'none'; };

    // Aktuellen Patienten archivieren
    archiveCurrentPatientBtn.onclick = () => {
        if (currentPatientId && confirm(`Möchten Sie Patient mit ID ${currentPatientId} wirklich archivieren?`)) {
            patientStore.archivePatient(currentPatientId);
            patientStore.setCurrentPatient(null);
            updatePatientDisplay();
            alert('Patient erfolgreich archiviert.');
        } else if (!currentPatientId) {
            alert('Bitte wählen Sie zuerst einen Patienten aus, um ihn zu archivieren.');
        }
    };

    // Notizen speichern
    savePatientNotesBtn.onclick = () => {
        if (currentPatientId) {
            const patient = patientStore.getCurrentPatient();
            if (patient) {
                patient.sections.notes = patientNotesContentElem.value;
                patientStore.updatePatient(patient);
                updateProgressBar(patient);
                alert('Notizen erfolgreich gespeichert!');
            }
        } else {
            alert('Kein Patient ausgewählt. Notizen können nicht gespeichert werden.');
        }
    };

    // Suche im Patientenauswahl-Modal
    patientSearchInput.onkeyup = () => {
        populatePatientList(patientSearchInput.value);
    };

    // Beim Initialisieren der Seite den Patientendisplay aktualisieren
    updatePatientDisplay();
}

// Globalisieren der Init-Funktion
window.initGeneralInfoPage = initGeneralInfoPage;