// general-info.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const patientNameSpan = document.getElementById('patientName');
    const patientDobSpan = document.getElementById('patientDob');
    const patientGenderSpan = document.getElementById('patientGender');
    const patientContactSpan = document.getElementById('patientContact');
    const patientIdSpan = document.getElementById('patientId');
    const patientBirthplaceSpan = document.getElementById('patientBirthplace');
    const patientCitySpan = document.getElementById('patientCity');
    const patientInsuranceSpan = document.getElementById('patientInsurance');
    const patientDiagnosisSpan = document.getElementById('patientDiagnosis');
    const patientHistorySpan = document.getElementById('patientHistory');
    const patientTreatmentsSpan = document.getElementById('patientTreatments');

    const selectPatientBtn = document.getElementById('selectPatientBtn');
    const clearPatientSelectionBtn = document.getElementById('clearPatientSelectionBtn');
    const editPatientBtn = document.getElementById('editPatientBtn');
    const deletePatientBtn = document.getElementById('deletePatientBtn');

    const toolbarNewPatientBtn = document.getElementById('toolbarNewPatientBtn');
    const addNoteBoxBtn = document.getElementById('addNoteBoxBtn');
    const toolbarShowArchiveModalBtn = document.getElementById('toolbarShowArchiveModalBtn');
    const archiveCurrentPatientBtn = document.getElementById('archiveCurrentPatientBtn');

    const patientSelectionModal = document.getElementById('patientSelectionModal');
    const closePatientSelectionModalBtn = document.getElementById('closePatientSelectionModal');
    const patientListUl = document.getElementById('patientList');
    const patientSearchInput = document.getElementById('patientSearchInput');

    const newPatientModal = document.getElementById('newPatientModal');
    const closeNewPatientModalBtn = document.getElementById('closeNewPatientModal');
    const newPatientForm = document.getElementById('newPatientForm');
    const cancelNewPatientBtn = document.getElementById('cancelNewPatientBtn');
    const newPatientModalTitle = document.getElementById('newPatientModalTitle');

    const patientNotesContainer = document.getElementById('patientNotesContainer');
    const savePatientNotesBtn = document.getElementById('savePatientNotesBtn');

    const progressPercentageSpan = document.getElementById('progressPercentage');
    const progressBarDiv = document.getElementById('progressBar');
    const nextStepSpan = document.getElementById('nextStep');

    const archiveModal = document.getElementById('archiveModal');
    const closeArchiveModalBtn = document.getElementById('closeArchiveModal');
    const templateListUl = document.getElementById('templateList');
    const archiveListUl = document.getElementById('archiveList');

    let isEditMode = false; // Flag to determine if the newPatientForm is for editing

    // --- Helper Functions ---

    /**
     * Closes a given modal.
     * @param {HTMLElement} modalElement - The modal DOM element to close.
     */
    const closeModal = (modalElement) => {
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
    };

    /**
     * Opens a given modal.
     * @param {HTMLElement} modalElement - The modal DOM element to open.
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
            patientNameSpan.textContent = `${currentPatient.first} ${currentPatient.last}`;
            patientDobSpan.textContent = currentPatient.dob;
            patientGenderSpan.textContent = currentPatient.gender;
            patientContactSpan.textContent = currentPatient.contact;
            patientIdSpan.textContent = currentPatient.id;
            patientBirthplaceSpan.textContent = currentPatient.birthplace;
            patientCitySpan.textContent = currentPatient.city;
            patientInsuranceSpan.textContent = currentPatient.insurance;
            patientDiagnosisSpan.textContent = currentPatient.diagnosis;
            patientHistorySpan.textContent = currentPatient.history;
            patientTreatmentsSpan.textContent = currentPatient.treatments;

            // Show/Hide buttons
            clearPatientSelectionBtn.style.display = 'inline-block';
            editPatientBtn.style.display = 'inline-block';
            deletePatientBtn.style.display = 'inline-block';
            selectPatientBtn.style.display = 'none'; // Hide select patient button

            // Enable notes
            patientNotesContainer.innerHTML = ''; // Clear previous notes
            if (currentPatient.sections && typeof currentPatient.sections.notes === 'string') {
                const noteBlocks = currentPatient.sections.notes.split('|||').filter(n => n.trim() !== '');
                if (noteBlocks.length === 0) {
                     addNoteTextarea(''); // Add at least one empty note field if none exist
                } else {
                    noteBlocks.forEach(note => addNoteTextarea(note));
                }
            } else {
                addNoteTextarea(''); // Add an empty note field if notes section is missing or not a string
            }
            savePatientNotesBtn.disabled = false;
            addNoteBoxBtn.disabled = false; // Enable 'Add Note' button

        } else {
            // No patient selected
            patientNameSpan.textContent = 'Bitte Patient auswählen';
            patientDobSpan.textContent = '';
            patientGenderSpan.textContent = '';
            patientContactSpan.textContent = '';
            patientIdSpan.textContent = '';
            patientBirthplaceSpan.textContent = '';
            patientCitySpan.textContent = '';
            patientInsuranceSpan.textContent = '';
            patientDiagnosisSpan.textContent = '';
            patientHistorySpan.textContent = '';
            patientTreatmentsSpan.textContent = '';

            // Hide/Show buttons
            clearPatientSelectionBtn.style.display = 'none';
            editPatientBtn.style.display = 'none';
            deletePatientBtn.style.display = 'none';
            selectPatientBtn.style.display = 'inline-block'; // Show select patient button

            // Disable notes
            patientNotesContainer.innerHTML = `
                <textarea class="note-textarea" rows="4" placeholder="Kein Patient ausgewählt. Notizen nicht verfügbar." disabled></textarea>
            `;
            savePatientNotesBtn.disabled = true;
            addNoteBoxBtn.disabled = true; // Disable 'Add Note' button
        }
        updateProgressBar();
    };

    /**
     * Updates the progress bar based on the completeness of the current patient's data.
     */
    const updateProgressBar = () => {
        const currentPatient = patientStore.getCurrentPatient();
        let completeness = 0;
        let filledFields = 0;
        const totalFields = 11; // Basic info fields: name, dob, gender, contact, id, birthplace, city, insurance, diagnosis, history, treatments

        if (currentPatient) {
            if (currentPatient.first && currentPatient.last) filledFields++;
            if (currentPatient.dob) filledFields++;
            if (currentPatient.gender) filledFields++;
            if (currentPatient.contact) filledFields++;
            if (currentPatient.id) filledFields++;
            if (currentPatient.birthplace) filledFields++;
            if (currentPatient.city) filledFields++;
            if (currentPatient.insurance) filledFields++;
            if (currentPatient.diagnosis) filledFields++;
            if (currentPatient.history) filledFields++;
            if (currentPatient.treatments) filledFields++;

            // Also consider sections completeness
            const sectionKeys = ['header', 'anamnesis', 'diagnosis', 'findings', 'therapy', 'prognosis', 'closing'];
            const totalSections = sectionKeys.length;
            let filledSections = 0;
            if (currentPatient.sections) {
                sectionKeys.forEach(key => {
                    if (currentPatient.sections[key] && currentPatient.sections[key].trim() !== '') {
                        filledSections++;
                    }
                });
            }

            // A simple combined completeness calculation
            // You might want to weigh these differently
            completeness = ((filledFields / totalFields) * 0.5 + (filledSections / totalSections) * 0.5) * 100;
            completeness = Math.min(100, Math.max(0, completeness)); // Ensure 0-100%

            progressPercentageSpan.textContent = `${Math.round(completeness)}%`;
            progressBarDiv.style.width = `${completeness}%`;

            if (completeness < 30) {
                nextStepSpan.textContent = 'Basisdaten vervollständigen';
            } else if (completeness < 70) {
                nextStepSpan.textContent = 'Medizinische Details eintragen';
            } else if (completeness < 100) {
                nextStepSpan.textContent = 'Notizen und Abschlussdetails hinzufügen';
            } else {
                nextStepSpan.textContent = 'Akte vollständig!';
            }
        } else {
            progressPercentageSpan.textContent = '0%';
            progressBarDiv.style.width = '0%';
            nextStepSpan.textContent = 'Patientendaten vervollständigen';
        }
    };

    /**
     * Populates the patient selection list within the modal.
     * @param {string} searchTerm - Optional search term to filter patients by name or ID.
     */
    const populatePatientList = (searchTerm = '') => {
        patientListUl.innerHTML = '';
        const patients = patientStore.getPatients().filter(p => !p.isArchived); // Only show active patients
        const filteredPatients = patients.filter(patient =>
            `${patient.first} ${patient.last}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredPatients.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Keine Patienten gefunden.';
            patientListUl.appendChild(li);
            return;
        }

        filteredPatients.forEach(patient => {
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
     * @param {string} content - The initial content for the textarea.
     */
    const addNoteTextarea = (content = '') => {
        const noteBlockDiv = document.createElement('div');
        noteBlockDiv.classList.add('note-block');

        const textarea = document.createElement('textarea');
        textarea.classList.add('note-textarea');
        textarea.rows = 4;
        textarea.placeholder = 'Hier Notiz eingeben...';
        textarea.value = content;
        textarea.disabled = !patientStore.getCurrentPatient(); // Disable if no patient selected

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-note-block-btn');
        deleteButton.textContent = 'Löschen';
        deleteButton.disabled = !patientStore.getCurrentPatient();
        deleteButton.addEventListener('click', () => {
            noteBlockDiv.remove();
            savePatientNotes(); // Save notes after deleting a block
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
        const notesContent = Array.from(noteTextareas).map(ta => ta.value.trim()).filter(note => note !== '');
        
        currentPatient.sections.notes = notesContent.join('|||'); // Use a delimiter to separate notes

        patientStore.updatePatient(currentPatient);
        alert('Notizen gespeichert!');
        updatePatientDisplay(); // Refresh display
    };

    /**
     * Populates the template and archive lists within the modal.
     */
    const populateArchiveAndTemplateLists = () => {
        templateListUl.innerHTML = '';
        archiveListUl.innerHTML = '';

        // Populate templates
        const templates = patientStore.getTemplates();
        if (templates.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Keine Vorlagen vorhanden.';
            templateListUl.appendChild(li);
        } else {
            templates.forEach(template => {
                const li = document.createElement('li');
                li.textContent = template.name;
                li.dataset.templateId = template.id;
                li.addEventListener('click', () => {
                    applyTemplateToCurrentPatient(template);
                });
                templateListUl.appendChild(li);
            });
        }

        // Populate archived patients
        const archivedPatients = patientStore.getPatients().filter(p => p.isArchived);
        if (archivedPatients.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Keine archivierten Patienten.';
            archiveListUl.appendChild(li);
        } else {
            archivedPatients.forEach(patient => {
                const li = document.createElement('li');
                li.textContent = `${patient.first} ${patient.last} (ID: ${patient.id})`;
                li.dataset.patientId = patient.id;

                const unarchiveBtn = document.createElement('button');
                unarchiveBtn.textContent = 'Entarchivieren';
                unarchiveBtn.style.marginLeft = '10px';
                unarchiveBtn.style.backgroundColor = '#28a745'; // Green
                unarchiveBtn.style.color = 'white';
                unarchiveBtn.style.border = 'none';
                unarchiveBtn.style.borderRadius = '4px';
                unarchiveBtn.style.padding = '5px 10px';
                unarchiveBtn.style.cursor = 'pointer';
                unarchiveBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent li click
                    if (confirm(`Soll Patient ${patient.first} ${patient.last} wirklich entarchiviert werden?`)) {
                        patientStore.unarchivePatient(patient.id);
                        populateArchiveAndTemplateLists(); // Refresh lists
                        updatePatientDisplay(); // Refresh main display if relevant
                        alert('Patient entarchiviert!');
                    }
                });
                li.appendChild(unarchiveBtn);
                archiveListUl.appendChild(li);
            });
        }
    };

    /**
     * Applies a selected template's sections to the currently selected patient's sections.
     * @param {object} template - The template object to apply.
     */
    const applyTemplateToCurrentPatient = (template) => {
        const currentPatient = patientStore.getCurrentPatient();
        if (!currentPatient) {
            alert('Bitte wählen Sie zuerst einen Patienten aus, um eine Vorlage anzuwenden.');
            return;
        }

        // Merge template sections into current patient's sections
        // This will overwrite existing section content with template content
        if (template.sections) {
            if (!currentPatient.sections) {
                currentPatient.sections = {};
            }
            Object.assign(currentPatient.sections, template.sections);
            patientStore.updatePatient(currentPatient);
            updatePatientDisplay(); // Refresh patient details
            alert(`Vorlage "${template.name}" auf Patient ${currentPatient.first} ${currentPatient.last} angewendet.`);
            closeModal(archiveModal);
        } else {
            alert('Die ausgewählte Vorlage enthält keine Sektionen zum Anwenden.');
        }
    };

    /**
     * Fills the new patient form with existing patient data for editing.
     * @param {object} patient - The patient object to load into the form.
     */
    const fillPatientFormForEdit = (patient) => {
        document.getElementById('newFirstName').value = patient.first || '';
        document.getElementById('newLastName').value = patient.last || '';
        document.getElementById('newDob').value = patient.dob || '';
        document.getElementById('newGender').value = patient.gender || '';
        document.getElementById('newContact').value = patient.contact || '';
        document.getElementById('newBirthplace').value = patient.birthplace || '';
        document.getElementById('newCity').value = patient.city || '';
        document.getElementById('newInsurance').value = patient.insurance || '';
        document.getElementById('newDiagnosis').value = patient.diagnosis || '';
        document.getElementById('newHistory').value = patient.history || '';
        document.getElementById('newTreatments').value = patient.treatments || '';
    };

    // --- Event Listeners ---

    // Patient Selection Modal
    selectPatientBtn.addEventListener('click', () => {
        populatePatientList();
        openModal(patientSelectionModal);
    });
    closePatientSelectionModalBtn.addEventListener('click', () => closeModal(patientSelectionModal));
    patientSearchInput.addEventListener('input', (e) => populatePatientList(e.target.value));

    // Clear Patient Selection
    clearPatientSelectionBtn.addEventListener('click', () => {
        if (confirm('Möchten Sie die Patientenauswahl wirklich aufheben?')) {
            patientStore.setCurrentPatient(null);
            updatePatientDisplay();
        }
    });

    // New Patient / Edit Patient Modal
    toolbarNewPatientBtn.addEventListener('click', () => {
        isEditMode = false;
        newPatientModalTitle.textContent = 'Neuen Patienten anlegen';
        newPatientForm.reset(); // Clear form fields
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

    newPatientForm.addEventListener('submit', (e) => {
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
            isArchived: false, // New patients are not archived by default
            sections: {} // Initialize sections for new patients
        };

        if (isEditMode) {
            const currentPatient = patientStore.getCurrentPatient();
            patientData.id = currentPatient.id; // Keep existing ID
            // Preserve existing sections if not explicitly updated through the form (which they aren't for these textareas)
            patientData.sections = { ...currentPatient.sections };
            patientStore.updatePatient(patientData);
            alert('Patientendaten aktualisiert!');
        } else {
            // New patient
            const newPatient = patientStore.addPatient(patientData);
            if (newPatient) {
                patientStore.setCurrentPatient(newPatient.id);
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
        const currentPatient = patientStore.getCurrentPatient();
        if (currentPatient && confirm(`Möchten Sie Patient ${currentPatient.first} ${currentPatient.last} (ID: ${currentPatient.id}) wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.`)) {
            patientStore.deletePatient(currentPatient.id);
            updatePatientDisplay();
            alert('Patient erfolgreich gelöscht.');
        }
    });

    // Add Note Box Button
    addNoteBoxBtn.addEventListener('click', () => {
        if (patientStore.getCurrentPatient()) {
            addNoteTextarea();
        } else {
            alert('Bitte wählen Sie zuerst einen Patienten aus, um Notizen hinzuzufügen.');
        }
    });

    // Save Patient Notes
    savePatientNotesBtn.addEventListener('click', savePatientNotes);

    // Archive Current Patient
    archiveCurrentPatientBtn.addEventListener('click', () => {
        const currentPatient = patientStore.getCurrentPatient();
        if (currentPatient && confirm(`Soll Patient ${currentPatient.first} ${currentPatient.last} wirklich archiviert werden?`)) {
            patientStore.archivePatient(currentPatient.id);
            updatePatientDisplay();
            alert('Patient archiviert!');
        } else if (!currentPatient) {
            alert('Bitte wählen Sie zuerst einen Patienten zum Archivieren aus.');
        }
    });

    // Archive / Template Modal
    toolbarShowArchiveModalBtn.addEventListener('click', () => {
        populateArchiveAndTemplateLists();
        openModal(archiveModal);
    });
    closeArchiveModalBtn.addEventListener('click', () => closeModal(archiveModal));

    // Initial display update when the page loads
    updatePatientDisplay();
});