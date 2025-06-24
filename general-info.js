/**
 * general-info.js
 * * HINWEIS: Der gesamte Code ist jetzt in eine `initGeneralInfoPage`-Funktion verlagert.
 * Diese wird aufgerufen, nachdem die komplette HTML-Seite in den DOM eingefügt wurde.
 */
window.initGeneralInfoPage = function() {

    // --- DOM Elements ---
    const patientNameSpan             = document.getElementById('patientName');
    const patientDobSpan              = document.getElementById('patientDob');
    const patientGenderSpan           = document.getElementById('patientGender');
    const patientContactSpan          = document.getElementById('patientContact');
    const patientIdSpan               = document.getElementById('patientId');
    const patientBirthplaceSpan       = document.getElementById('patientBirthplace');
    const patientCitySpan             = document.getElementById('patientCity');
    const patientInsuranceSpan        = document.getElementById('patientInsurance');
    const patientDiagnosisSpan        = document.getElementById('patientDiagnosis');
    const patientHistorySpan          = document.getElementById('patientHistory');
    const patientTreatmentsSpan       = document.getElementById('patientTreatments');

    const selectPatientBtn            = document.getElementById('selectPatientBtn');
    const clearPatientSelectionBtn    = document.getElementById('clearPatientSelectionBtn');
    const editPatientBtn              = document.getElementById('editPatientBtn');
    const deletePatientBtn            = document.getElementById('deletePatientBtn');
    const archiveModalCloseBtn        = document.getElementById('archiveModalCloseBtn');

    const toolbarNewPatientBtn        = document.getElementById('toolbarNewPatientBtn');
    const addNoteBoxBtn               = document.getElementById('addNoteBoxBtn');
    const toolbarShowArchiveModalBtn  = document.getElementById('toolbarShowArchiveModalBtn');
    const archiveCurrentPatientBtn    = document.getElementById('archiveCurrentPatientBtn');

    const patientSelectionModal       = document.getElementById('patientSelectionModal');
    const closePatientSelectionModalBtn = document.getElementById('closePatientSelectionModal');
    const patientListUl               = document.getElementById('patientList');
    const patientSearchInput          = document.getElementById('patientSearchInput');

    const newPatientModal             = document.getElementById('newPatientModal');
    const closeNewPatientModalBtn     = document.getElementById('closeNewPatientModal');
    const newPatientForm              = document.getElementById('newPatientForm');
    const cancelNewPatientBtn         = document.getElementById('cancelNewPatientBtn');
    const newPatientModalTitle        = document.getElementById('newPatientModalTitle');

    const patientNotesContainer       = document.getElementById('patientNotesContainer');
    const savePatientNotesBtn         = document.getElementById('savePatientNotesBtn');

    const progressPercentageSpan      = document.getElementById('progressPercentage');
    const progressBarDiv              = document.getElementById('progressBar');
    const nextStepSpan                = document.getElementById('nextStep');

    const archiveModal                = document.getElementById('archiveModal');
    const closeArchiveModalBtn2       = document.getElementById('closeArchiveModal');
    const templateListUl              = document.getElementById('templateList');
    const archiveListUl               = document.getElementById('archiveList');

    let isEditMode = false; // Flag to determine if the newPatientForm is for editing

    // --- Helper Functions ---

    /**
     * Closes a given modal.
     * @param {HTMLElement} modalElement
     */
    const closeModal = (modalElement) => {
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
    };

    /**
     * Opens a given modal.
     * @param {HTMLElement} modalElement
     */
    const openModal = (modalElement) => {
        modalElement.style.display = 'flex'; // Use flex to center content
        modalElement.setAttribute('aria-hidden', 'false');
    };

    /**
     * Updates the display with the currently selected patient's information.
     */
    const updatePatientDisplay = () => {
        const currentPatient = patientStore.getCurrentPatient();

        if (currentPatient) {
            // Populate basic fields
            patientNameSpan.textContent        = `${currentPatient.first} ${currentPatient.last}`;
            patientDobSpan.textContent         = currentPatient.dob;
            patientGenderSpan.textContent      = currentPatient.gender;
            patientContactSpan.textContent     = currentPatient.contact;
            patientIdSpan.textContent          = currentPatient.id;
            patientBirthplaceSpan.textContent  = currentPatient.birthplace;
            patientCitySpan.textContent        = currentPatient.city;
            patientInsuranceSpan.textContent   = currentPatient.insurance;
            patientDiagnosisSpan.textContent   = currentPatient.diagnosis;
            patientHistorySpan.textContent     = currentPatient.history;
            patientTreatmentsSpan.textContent  = currentPatient.treatments;

            // Show/Hide action buttons
            clearPatientSelectionBtn.style.display = 'inline-block';
            editPatientBtn.style.display           = 'inline-block';
            deletePatientBtn.style.display         = 'inline-block';
            selectPatientBtn.style.display         = 'none';

            // Notes
            patientNotesContainer.innerHTML = '';
            if (currentPatient.sections && typeof currentPatient.sections.notes === 'string') {
                const noteBlocks = currentPatient.sections.notes.split('|||').filter(n => n.trim() !== '');
                if (noteBlocks.length === 0) {
                    addNoteTextarea('');
                } else {
                    noteBlocks.forEach(note => addNoteTextarea(note));
                }
            } else {
                addNoteTextarea('');
            }
            savePatientNotesBtn.disabled = false;
            addNoteBoxBtn.disabled       = false;

        } else {
            // No patient selected → reset everything
            [ patientNameSpan, patientDobSpan, patientGenderSpan,
              patientContactSpan, patientIdSpan, patientBirthplaceSpan,
              patientCitySpan, patientInsuranceSpan, patientDiagnosisSpan,
              patientHistorySpan, patientTreatmentsSpan
            ].forEach(span => span.textContent = '');

            clearPatientSelectionBtn.style.display = 'none';
            editPatientBtn.style.display           = 'none';
            deletePatientBtn.style.display         = 'none';
            selectPatientBtn.style.display         = 'inline-block';

            patientNotesContainer.innerHTML = `
                <textarea class="note-textarea" rows="4"
                    placeholder="Kein Patient ausgewählt. Notizen nicht verfügbar."
                    disabled></textarea>`;
            savePatientNotesBtn.disabled = true;
            addNoteBoxBtn.disabled       = true;
        }

        updateProgressBar();
    };

    /**
     * Updates the progress bar based on the completeness of the current patient's data.
     */
    const updateProgressBar = () => {
        const currentPatient = patientStore.getCurrentPatient();
        let completeness = 0, filledFields = 0;
        const totalFields = 11;

        if (currentPatient) {
            if (currentPatient.first && currentPatient.last) filledFields++;
            if (currentPatient.dob)            filledFields++;
            if (currentPatient.gender)         filledFields++;
            if (currentPatient.contact)        filledFields++;
            if (currentPatient.id)             filledFields++;
            if (currentPatient.birthplace)     filledFields++;
            if (currentPatient.city)           filledFields++;
            if (currentPatient.insurance)      filledFields++;
            if (currentPatient.diagnosis)      filledFields++;
            if (currentPatient.history)        filledFields++;
            if (currentPatient.treatments)     filledFields++;

            // Sections
            const sectionKeys = ['header','anamnesis','diagnosis','findings','therapy','prognosis','closing'];
            const totalSections = sectionKeys.length;
            let filledSections = 0;
            if (currentPatient.sections) {
                sectionKeys.forEach(key => {
                    if (currentPatient.sections[key]?.trim()) filledSections++;
                });
            }

            completeness = ((filledFields/totalFields)*0.5 + (filledSections/totalSections)*0.5)*100;
            completeness = Math.min(100, Math.max(0, completeness));

            progressPercentageSpan.textContent = `${Math.round(completeness)}%`;
            progressBarDiv.style.width         = `${completeness}%`;

            if (completeness < 30)         nextStepSpan.textContent = 'Basisdaten vervollständigen';
            else if (completeness < 70)    nextStepSpan.textContent = 'Medizinische Details eintragen';
            else if (completeness < 100)   nextStepSpan.textContent = 'Notizen und Abschlussdetails hinzufügen';
            else                            nextStepSpan.textContent = 'Akte vollständig!';
        } else {
            progressPercentageSpan.textContent = '0%';
            progressBarDiv.style.width         = '0%';
            nextStepSpan.textContent           = 'Patientendaten vervollständigen';
        }
    };

    /**
     * Populates the patient selection list within the modal.
     * @param {string} searchTerm
     */
    const populatePatientList = (searchTerm = '') => {
        patientListUl.innerHTML = '';
        const patients = patientStore.getPatients().filter(p => !p.isArchived);
        const filtered = patients.filter(p =>
            (`${p.first} ${p.last}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.id.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filtered.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Keine Patienten gefunden.';
            patientListUl.appendChild(li);
            return;
        }

        filtered.forEach(patient => {
            const li = document.createElement('li');
            li.textContent = `${patient.first} ${patient.last} (ID: ${patient.id})`;
            li.dataset.patientId = patient.id;
            li.addEventListener('click', () => {
                patientStore.setCurrentPatient(patient.id);
                updatePatientDisplay();
                closeModal(patientSelectionModal);
            });
            patientListUl.appendChild(li);
        });
    };

    /**
     * Adds a new textarea for notes or populates with existing note content.
     * @param {string} content
     */
    const addNoteTextarea = (content = '') => {
        const noteBlockDiv = document.createElement('div');
        noteBlockDiv.classList.add('note-block');

        const textarea = document.createElement('textarea');
        textarea.classList.add('note-textarea');
        textarea.rows = 4;
        textarea.placeholder = 'Hier Notiz eingeben...';
        textarea.value = content;
        textarea.disabled = !patientStore.getCurrentPatient();

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-note-block-btn');
        deleteButton.textContent = 'Löschen';
        deleteButton.disabled = !patientStore.getCurrentPatient();
        deleteButton.addEventListener('click', () => {
            noteBlockDiv.remove();
            savePatientNotes();
        });

        noteBlockDiv.appendChild(textarea);
        noteBlockDiv.appendChild(deleteButton);
        patientNotesContainer.appendChild(noteBlockDiv);
    };

    /**
     * Saves all current notes from the textareas back to the selected patient.
     */
    const savePatientNotes = () => {
        const currentPatient = patientStore.getCurrentPatient();
        if (!currentPatient) return;

        const noteTextareas = patientNotesContainer.querySelectorAll('.note-textarea');
        const notesContent = Array.from(noteTextareas)
            .map(ta => ta.value.trim())
            .filter(n => n !== '');

        currentPatient.sections.notes = notesContent.join('|||');
        patientStore.updatePatient(currentPatient);
        alert('Notizen gespeichert!');
        updatePatientDisplay();
    };

    /**
     * Populates the template and archive lists within the modal.
     */
    const populateArchiveAndTemplateLists = () => {
        templateListUl.innerHTML = '';
        archiveListUl.innerHTML  = '';

        // Templates
        const templates = patientStore.getTemplates();
        if (templates.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Keine Vorlagen vorhanden.';
            templateListUl.appendChild(li);
        } else {
            templates.forEach(tpl => {
                const li = document.createElement('li');
                li.textContent = tpl.name;
                li.dataset.templateId = tpl.id;
                li.addEventListener('click', () => applyTemplateToCurrentPatient(tpl));
                templateListUl.appendChild(li);
            });
        }

        // Archived
        const archived = patientStore.getPatients().filter(p => p.isArchived);
        if (archived.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Keine archivierten Patienten.';
            archiveListUl.appendChild(li);
        } else {
            archived.forEach(patient => {
                const li = document.createElement('li');
                li.textContent = `${patient.first} ${patient.last} (ID: ${patient.id})`;
                const unarchiveBtn = document.createElement('button');
                unarchiveBtn.textContent = 'Entarchivieren';
                Object.assign(unarchiveBtn.style, {
                    marginLeft: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    cursor: 'pointer'
                });
                unarchiveBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    if (confirm(`Soll Patient ${patient.first} ${patient.last} wirklich entarchiviert werden?`)) {
                        patientStore.unarchivePatient(patient.id);
                        populateArchiveAndTemplateLists();
                        updatePatientDisplay();
                        alert('Patient entarchiviert!');
                    }
                });
                li.appendChild(unarchiveBtn);
                archiveListUl.appendChild(li);
            });
        }
    };

    /**
     * Applies a selected template's sections to the current patient.
     * @param {object} template
     */
    const applyTemplateToCurrentPatient = template => {
        const currentPatient = patientStore.getCurrentPatient();
        if (!currentPatient) {
            alert('Bitte wählen Sie zuerst einen Patienten aus, um eine Vorlage anzuwenden.');
            return;
        }
        if (template.sections) {
            currentPatient.sections = Object.assign({}, currentPatient.sections, template.sections);
            patientStore.updatePatient(currentPatient);
            updatePatientDisplay();
            alert(`Vorlage "${template.name}" angewendet.`);
            closeModal(archiveModal);
        } else {
            alert('Die ausgewählte Vorlage enthält keine Sektionen.');
        }
    };

    /**
     * Fills the new-patient form for editing.
     * @param {object} patient
     */
    const fillPatientFormForEdit = patient => {
        document.getElementById('newFirstName').value    = patient.first    || '';
        document.getElementById('newLastName').value     = patient.last     || '';
        document.getElementById('newDob').value          = patient.dob      || '';
        document.getElementById('newGender').value       = patient.gender   || '';
        document.getElementById('newContact').value      = patient.contact  || '';
        document.getElementById('newBirthplace').value   = patient.birthplace || '';
        document.getElementById('newCity').value         = patient.city     || '';
        document.getElementById('newInsurance').value    = patient.insurance || '';
        document.getElementById('newDiagnosis').value    = patient.diagnosis || '';
        document.getElementById('newHistory').value      = patient.history   || '';
        document.getElementById('newTreatments').value   = patient.treatments || '';
    };

    // --- Event Listeners ---

    // Patient Selection Modal
    selectPatientBtn.addEventListener('click', () => {
        populatePatientList();
        openModal(patientSelectionModal);
    });
    closePatientSelectionModalBtn.addEventListener('click', () => closeModal(patientSelectionModal));
    patientSearchInput.addEventListener('input', e => populatePatientList(e.target.value));

    // Clear Selection
    clearPatientSelectionBtn.addEventListener('click', () => {
        if (confirm('Möchten Sie die Patientenauswahl wirklich aufheben?')) {
            patientStore.setCurrentPatient(null);
            updatePatientDisplay();
        }
    });

    // New / Edit Patient
    toolbarNewPatientBtn.addEventListener('click', () => {
        isEditMode = false;
        newPatientModalTitle.textContent = 'Neuen Patienten anlegen';
        newPatientForm.reset();
        openModal(newPatientModal);
    });
    editPatientBtn.addEventListener('click', () => {
        const currentPatient = patientStore.getCurrentPatient();
        if (currentPatient) {
            isEditMode = true;
            newPatientModalTitle.textContent = 'Patientendaten bearbeiten';
            fillPatientFormForEdit(currentPatient);
            openModal(newPatientModal);
        } else {
            alert('Bitte wählen Sie zuerst einen Patienten zum Bearbeiten aus.');
        }
    });
    closeNewPatientModalBtn.addEventListener('click', () => closeModal(newPatientModal));
    cancelNewPatientBtn.addEventListener('click', () => closeModal(newPatientModal));

    newPatientForm.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(newPatientForm);
        const patientData = {
            first: formData.get('first'),
            last: formData.get('last'),
            dob: formData.get('dob'),
            gender: formData.get('gender'),
            contact: formData.get('contact'),
            birthplace: formData.get('birthplace'),
            city: formData.get('city'),
            insurance: formData.get('insurance'),
            diagnosis: formData.get('diagnosis'),
            history: formData.get('history'),
            treatments: formData.get('treatments'),
            isArchived: false,
            sections: {}
        };

        if (isEditMode) {
            const current = patientStore.getCurrentPatient();
            patientData.id       = current.id;
            patientData.sections = { ...current.sections };
            patientStore.updatePatient(patientData);
            alert('Patientendaten aktualisiert!');
        } else {
            const newP = patientStore.addPatient(patientData);
            if (newP) {
                patientStore.setCurrentPatient(newP.id);
                alert('Neuer Patient erfolgreich angelegt!');
            } else {
                alert('Fehler beim Anlegen des Patienten.');
            }
        }
        updatePatientDisplay();
        closeModal(newPatientModal);
    });

    // Delete Patient
    deletePatientBtn.addEventListener('click', () => {
        const current = patientStore.getCurrentPatient();
        if (current && confirm(
            `Möchten Sie Patient ${current.first} ${current.last} (ID: ${current.id}) wirklich löschen?`
        )) {
            patientStore.deletePatient(current.id);
            updatePatientDisplay();
            alert('Patient erfolgreich gelöscht.');
        }
    });

    // Notes
    addNoteBoxBtn.addEventListener('click', () => {
        if (patientStore.getCurrentPatient()) addNoteTextarea();
        else alert('Bitte wählen Sie zuerst einen Patienten aus, um Notizen hinzuzufügen.');
    });
    savePatientNotesBtn.addEventListener('click', savePatientNotes);

    // Archive Current Patient
    archiveCurrentPatientBtn.addEventListener('click', () => {
        const current = patientStore.getCurrentPatient();
        if (current && confirm(`Soll Patient ${current.first} ${current.last} wirklich archiviert werden?`)) {
            patientStore.archivePatient(current.id);
            updatePatientDisplay();
            alert('Patient archiviert!');
        } else if (!current) {
            alert('Bitte wählen Sie zuerst einen Patienten zum Archivieren aus.');
        }
    });

    // Archive / Template Modal
    toolbarShowArchiveModalBtn.addEventListener('click', () => {
        populateArchiveAndTemplateLists();
        openModal(archiveModal);
    });
    closeArchiveModalBtn2.addEventListener('click', () => closeModal(archiveModal));

    // --- Initial call ---
    updatePatientDisplay();
};
