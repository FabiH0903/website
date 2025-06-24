// editor.js

// Globale Initialisierungsfunktion für den Editor
function initEditorPage() {
    console.log("initEditorPage called, initializing editor toolbar.");

    // Referenzen zu den HTML-Elementen
    const editorHeader = document.getElementById('editorHeader');
    const editorAnamnesis = document.getElementById('editorAnamnesis');
    const editorDiagnosis = document.getElementById('editorDiagnosis');
    const editorFindings = document.getElementById('editorFindings');
    const editorTherapy = document.getElementById('editorTherapy');
    const editorPrognosis = document.getElementById('editorPrognosis');
    const editorClosing = document.getElementById('editorClosing');

    const loadKiDraftBtn = document.getElementById('loadKiDraftBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const printDraftBtn = document.getElementById('printDraftBtn');
    const exportTextBtn = document.getElementById('exportTextBtn');

    // NEU: Toolbar-Elemente
    const editorToolbar = document.getElementById('editorToolbar');
    const fontSelect = document.getElementById('fontSelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const foreColorPicker = document.getElementById('foreColorPicker'); // NEU: Textfarbe
    const backColorPicker = document.getElementById('backColorPicker'); // NEU: Hintergrundfarbe

    const patient = patientStore.getCurrentPatient();

    // Variable, um die aktuelle Auswahl zu speichern, da execCommand den Fokus verlieren kann
    let savedRange = null;

    // Funktion zum Speichern der aktuellen Textauswahl
    function saveSelection() {
        if (window.getSelection) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0);
            }
        } else if (document.selection && document.selection.createRange) {
            savedRange = document.selection.createRange();
        }
    }

    // Funktion zum Wiederherstellen der gespeicherten Textauswahl
    function restoreSelection() {
        if (savedRange) {
            if (window.getSelection) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(savedRange);
            } else if (document.selection && savedRange.select) {
                savedRange.select();
            }
        }
    }

    // Funktion zum Ausführen von Formatierungsbefehlen
    function executeCommand(command, value = null) {
        // Fokus auf das aktuell aktive editable-box Element setzen, BEVOR der Befehl ausgeführt wird
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('editable-box')) {
            // Speichere die aktuelle Auswahl vor dem Befehl
            saveSelection();
            document.execCommand(command, false, value);
            // Restore selection after command (might be useful for some commands or to keep cursor position)
            restoreSelection();
            activeElement.focus(); // Fokus nach dem Befehl wiederherstellen
        } else {
            alert('Bitte wählen Sie zuerst Text in einem Editor-Feld aus oder platzieren Sie den Cursor dort.');
        }
        updateToolbarState(); // Toolbar-Status nach dem Befehl aktualisieren
    }

    // Hilfsfunktion zum Konvertieren von RGB in Hex (für Color Picker)
    function rgbToHex(rgb) {
        if (!rgb || rgb.startsWith('rgba')) return '#000000'; // Standard oder transparent
        const components = rgb.match(/\d+/g);
        if (!components || components.length < 3) return '#000000';
        return "#" + ((1 << 24) + (parseInt(components[0]) << 16) + (parseInt(components[1]) << 8) + parseInt(components[2])).toString(16).slice(1);
    }

    // Funktion zur Aktualisierung des Toolbar-Status (z.B. ob Bold aktiv ist)
    function updateToolbarState() {
        // Aktualisiere Schriftart und Größe
        const selectedFont = document.queryCommandValue("fontname");
        if (fontSelect && selectedFont) {
            const cleanFont = selectedFont.replace(/"/g, ''); // Browser geben oft "fontname" in Anführungszeichen zurück
            if (fontSelect.value !== cleanFont) {
                fontSelect.value = cleanFont;
            }
        }

        const selectedFontSize = document.queryCommandValue("fontsize");
        if (fontSizeSelect && selectedFontSize) {
            if (fontSizeSelect.value !== selectedFontSize) {
                fontSizeSelect.value = selectedFontSize;
            }
        }

        // Aktualisiere Farbwahl
        const foreColor = document.queryCommandValue("forecolor");
        if (foreColorPicker && foreColor) {
            // queryCommandValue gibt oft RGB zurück, wir brauchen Hex für den input[type="color"]
            const hexColor = rgbToHex(foreColor);
            if (foreColorPicker.value.toLowerCase() !== hexColor.toLowerCase()) {
                foreColorPicker.value = hexColor;
            }
        } else if (foreColorPicker) {
            // Setze auf Standard, wenn keine spezifische Farbe gefunden wird
            // Dies ist komplexer, da der Browser default-Farben unterschiedlich handhabt
            // Für Einfachheit kann man einen Initialwert setzen
            // foreColorPicker.value = '#333333';
        }

        const backColor = document.queryCommandValue("backcolor");
        if (backColorPicker && backColor) {
            const hexColor = rgbToHex(backColor);
            if (backColorPicker.value.toLowerCase() !== hexColor.toLowerCase()) {
                backColorPicker.value = hexColor;
            }
        } else if (backColorPicker) {
            // backColorPicker.value = '#ffffff';
        }


        // Aktualisiere den 'active'-Status für Bold, Italic, Underline
        document.querySelectorAll('.toolbar-btn[data-command="bold"]').forEach(btn => {
            btn.classList.toggle('active', document.queryCommandState('bold'));
        });
        document.querySelectorAll('.toolbar-btn[data-command="italic"]').forEach(btn => {
            btn.classList.toggle('active', document.queryCommandState('italic'));
        });
        document.querySelectorAll('.toolbar-btn[data-command="underline"]').forEach(btn => {
            btn.classList.toggle('active', document.queryCommandState('underline'));
        });
    }


    // Funktion zum Laden eines KI-generierten Entwurfs (Beispieltexte)
    // Habe hier die HTML-Tags direkt in den Beispieltexten eingefügt,
    // um die Anwendung der Formatierungen zu demonstrieren.
        function loadKiDraft() {
        if (!patient) {
            alert('Please select a patient on the "General Information" page first to load an AI draft.');
            return;
        }

        const patientName = `${patient.first || '[First Name]'} ${patient.last || '[Last Name]'}`;
        const patientDob = patient.dob || '[DD.MM.YYYY]';
        const patientId = patient.id || '[Patient ID]';
        const patientGender = patient.gender || '[Gender]';
        const patientDiagnosis = patient.diagnosis || '[Preliminary Diagnosis]';
        const patientMainComplaint = patient.mainComplaint || '[Main Complaint]';

        editorHeader.innerHTML = `
            <b><span style="font-size: 16px;">${patientName}</span></b>, born on ${patientDob} (ID: ${patientId})<br>
            Address: ${patient.address || '[Patient Address]'}<br>
            Phone: ${patient.phone || '[Patient Phone]'}<br>
            <br>
            <span style="font-size: 18px; color: #e85d75;"><b>Subject:</b> Discharge Letter for ${patientName}</span><br>
            <br>
            Dear Colleague,
        `;

        editorAnamnesis.innerHTML = patient.sections.anamnesis || `
            <b><u>Anamnesis:</u></b><br>
            The ${patientGender === 'male' ? 'patient' : 'patient'} presents with a chief complaint of <i><b>${patientMainComplaint}</b></i>, which started approximately 3 days ago.
            <br>
            <b>Current Symptoms:</b>
            <ul>
                ${patient.currentSymptoms.map(s => `<li>${s}</li>`).join('') || '<li>No specific current symptoms reported.</li>'}
            </ul>
            <b>Past Medical History:</b>
            <ul>
                ${patient.pastMedicalHistory.map(h => `<li>${h}</li>`).join('') || '<li>No significant past medical history.</li>'}
            </ul>
            <b>Medications:</b>
            <ul>
                ${patient.medications.map(m => `<li>${m}</li>`).join('') || '<li>No regular medications.</li>'}
            </ul>
            <b>Allergies:</b> ${patient.allergies.join(', ') || 'None known'}.
            <br>
            Social history: [Social history details]. Family history: [Family history details].
        `;

        // Updated Diagnosis Section for more detail
        editorDiagnosis.innerHTML = patient.sections.diagnosis || `
            <b><u>Primary Diagnosis:</u></b><br>
            <ul>
                <li><b>Acute Tonsillitis</b> (ICD-10: J03.9) - Based on clinical presentation of fever, dysphagia, and inflamed tonsils with exudate.</li>
                ${patientDiagnosis && patientDiagnosis !== 'Acute Tonsillitis' && patientDiagnosis !== '[Preliminary Diagnosis]' ? `<li>Secondary Diagnosis: ${patientDiagnosis} (Preliminary)</li>` : ''}
                <li>Associated Condition: Mild Dehydration (E86.0) - Due to reduced fluid intake from dysphagia.</li>
            </ul>
            <b><u>Differential Diagnoses Considered:</u></b>
            <ul>
                <li>Peritonsillar abscess (ruled out by lack of unilateral swelling/trismus)</li>
                <li>Infectious Mononucleosis (awaiting specific lab results)</li>
            </ul>
        `;

        editorFindings.innerHTML = `
            <b><u>Findings:</u></b><br>
            <ul>
                <li>Clinical Examination: ${patientGender === 'male' ? 'Patient' : 'Patient'} appears ill but is alert and oriented. Oral examination reveals significantly reddened pharynx with enlarged, hyperemic tonsils exhibiting bilateral purulent exudate. No signs of airway obstruction.</li>
                <li>Palpation: Tender cervical lymphadenopathy noted bilaterally (jugulodigastric chain).</li>
                <li>Vital Signs: BP 120/80 mmHg, HR 88 bpm, RR 16/min, Temp 37.2°C (post-antipyretic).</li>
                <li>Laboratory Results:
                    <ul>
                        ${patient.labResults.map(l => `<li><b>${l.test}:</b> ${l.value} (Ref: ${l.ref})</li>`).join('') || '<li>No specific lab results available.</li>'}
                        <li>Rapid Strep Test: Negative</li>
                    </ul>
                </li>
                <li>Imaging Results:
                    <ul>
                        ${patient.imagingResults.map(i => `<li><b>${i.modality}:</b> ${i.finding}</li>`).join('') || '<li>No imaging performed.</li>'}
                    </ul>
                </li>
            </ul>
        `;

        // NEW: Treatment Plan content
        editorTherapy.innerHTML = patient.sections.treatmentPlan || `
            <b><u>Treatment Plan & Recommendations:</u></b><br>
            The patient was initiated on conservative management and symptomatic relief.
            <ol>
                <li><b>Medication:</b>
                    <ul>
                        <li>Paracetamol 500mg, 1 tablet orally every 6 hours as needed for fever/pain (max 4 doses/day).</li>
                        <li>Consider Ibuprofen 400mg if pain persists (check for contraindications).</li>
                    </ul>
                </li>
                <li><b>Supportive Care:</b>
                    <ul>
                        <li>Encourage adequate oral fluid intake to prevent dehydration.</li>
                        <li>Warm saline gargles or chamomile gargles 3-4 times daily for throat discomfort.</li>
                        <li>Rest and avoidance of strenuous activities.</li>
                    </ul>
                </li>
                <li><b>Monitoring:</b>
                    <ul>
                        <li>Monitor for worsening symptoms (e.g., increased difficulty swallowing, shortness of breath, spreading redness/swelling).</li>
                        <li>Educate on signs of dehydration.</li>
                    </ul>
                </li>
                <li><b>Follow-up:</b>
                    <ul>
                        <li>Return to clinic in 48 hours for re-evaluation if symptoms do not improve or worsen.</li>
                        <li>Consider antibiotic therapy (e.g., Amoxicillin) if bacterial infection is confirmed (e.g., by culture) or clinical suspicion remains high.</li>
                    </ul>
                </li>
            </ol>
        `;

        // NEW: Prognosis & Further Course (more detailed)
        editorPrognosis.innerHTML = `
            <b><u>Prognosis & Further Course:</u></b><br>
            The overall prognosis is good with conservative management. Acute tonsillitis typically resolves within 7-10 days.
            <br>
            <b><u>Recommendations for Patient:</u></b>
            <ul>
                <li>Maintain good oral hygiene.</li>
                <li>Avoid irritants (e.g., smoking, very hot/cold foods).</li>
                <li>Complete any prescribed medication course, even if symptoms improve earlier.</li>
                <li>Strict adherence to follow-up instructions is important for ensuring full recovery and ruling out complications.</li>
                <li>If new symptoms develop (e.g., rash, joint pain, significant swelling of the neck), seek immediate medical attention.</li>
            </ul>
            Further diagnostic tests (e.g., throat swab for culture) may be considered if symptoms persist or atypical presentations arise.
        `;

        editorClosing.innerHTML = `
            Sincerely,<br>
            <br>
            Dr. [Doctor's Name]<br>
            [Practice Name]<br>
            <span style="background-color: #FFFF00;">[Date: ${new Date().toLocaleDateString('en-US')}]</span>
        `;

        alert('Example AI draft loaded. Please review and adjust.');
        updateToolbarState(); // Update toolbar status after loading
    }
    // Funktion zum Speichern des Entwurfs (im Browser-Speicher) - unverändert
    function saveDraft() {
        if (!patient) {
            alert('Kein Patient ausgewählt. Entwurf kann nicht gespeichert werden.');
            return;
        }

        patient.sections.letterDraft = JSON.stringify({
            header: editorHeader.innerHTML,
            anamnesis: editorAnamnesis.innerHTML,
            diagnosis: editorDiagnosis.innerHTML,
            findings: editorFindings.innerHTML,
            therapy: editorTherapy.innerHTML,
            prognosis: editorPrognosis.innerHTML,
            closing: editorClosing.innerHTML
        });

        patientStore.updatePatient(patient);
        alert('Arztbrief-Entwurf gespeichert!');
    }

    // Funktion zum Laden eines gespeicherten Entwurfs - unverändert
    function loadSavedDraft() {
        if (patient && patient.sections.letterDraft) {
            try {
                const savedContent = JSON.parse(patient.sections.letterDraft);
                editorHeader.innerHTML = savedContent.header || '';
                editorAnamnesis.innerHTML = savedContent.anamnesis || '';
                editorDiagnosis.innerHTML = savedContent.diagnosis || '';
                editorFindings.innerHTML = savedContent.findings || '';
                editorTherapy.innerHTML = savedContent.therapy || '';
                editorPrognosis.innerHTML = savedContent.prognosis || '';
                editorClosing.innerHTML = savedContent.closing || '';
                updateToolbarState(); // Toolbar-Status nach dem Laden aktualisieren
            } catch (e) {
                console.error("Fehler beim Parsen des gespeicherten Entwurfs:", e);
                // Fallback für alte, nicht-JSON-basierte letterDrafts
                editorAnamnesis.innerHTML = patient.sections.letterDraft;
                alert('Gespeicherter Entwurf konnte nicht vollständig geladen werden (möglicherweise altes Format).');
            }
        }
    }

    // Funktion zum Drucken / Exportieren als PDF - unverändert
    function printDraft() {
        window.print();
    }

    // Funktion zum Exportieren als reiner Text - unverändert
    function exportText() {
        let fullText = '';
        const sections = [
            { label: 'Briefkopf & Patientendaten', element: editorHeader },
            { label: 'Anamnesis', element: editorAnamnesis },
            { label: 'Diagnosis', element: editorDiagnosis },
            { label: 'Befunde', element: editorFindings },
            { label: 'Therapie & Medikation', element: editorTherapy },
            { label: 'Prognose & Weiteres Vorgehen', element: editorPrognosis },
            { label: 'Grußformel & Unterschrift', element: editorClosing }
        ];

        sections.forEach(section => {
            const content = section.element.innerText.trim();
            if (content) {
                fullText += `--- ${section.label} ---\n${content}\n\n`;
            }
        });

        if (fullText) {
            const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            const patientNameForFile = patient ? `${patient.first}_${patient.last}` : 'Arztbrief';
            const filename = `Arztbrief_${patientNameForFile}_${new Date().toLocaleDateString('de-DE').replace(/\./g, '-')}.txt`;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            alert('Text erfolgreich exportiert!');
        } else {
            alert('Der Editor enthält keinen Text zum Exportieren.');
        }
    }


    // --- Event Listener registrieren ---
    if (loadKiDraftBtn) loadKiDraftBtn.addEventListener('click', loadKiDraft);
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', saveDraft);
    if (printDraftBtn) printDraftBtn.addEventListener('click', printDraft);
    if (exportTextBtn) exportTextBtn.addEventListener('click', exportText);

    // NEU: Event Listener für die Toolbar-Buttons
    if (editorToolbar) {
        editorToolbar.addEventListener('click', (event) => {
            const target = event.target.closest('.toolbar-btn'); // Nutze closest, um auch Kind-Elemente zu treffen
            if (target && target.dataset.command) {
                executeCommand(target.dataset.command);
            }
        });
    }

    // NEU: Event Listener für Schriftart-Dropdown
    if (fontSelect) {
        fontSelect.addEventListener('change', (event) => {
            executeCommand('fontname', event.target.value);
        });
    }

    // NEU: Event Listener für Schriftgröße-Dropdown
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (event) => {
            executeCommand('fontsize', event.target.value);
        });
    }

    // NEU: Event Listener für Textfarbe
    if (foreColorPicker) {
        foreColorPicker.addEventListener('input', (event) => { // 'input' für Echtzeit-Update beim Ziehen
            executeCommand('forecolor', event.target.value);
        });
        foreColorPicker.addEventListener('change', (event) => { // 'change' für finales Update
             executeCommand('forecolor', event.target.value);
             updateToolbarState(); // Toolbar-Status nach Farbwahl aktualisieren
        });
    }

    // NEU: Event Listener für Hintergrundfarbe
    if (backColorPicker) {
        backColorPicker.addEventListener('input', (event) => {
            executeCommand('backcolor', event.target.value);
        });
        backColorPicker.addEventListener('change', (event) => {
            executeCommand('backcolor', event.target.value);
            updateToolbarState(); // Toolbar-Status nach Farbwahl aktualisieren
        });
    }

    // NEU: Event Listener für alle editable-boxes, um den Toolbar-Status zu aktualisieren
    // Wenn der Fokus wechselt oder sich die Auswahl ändert
    document.querySelectorAll('.editable-box').forEach(box => {
        box.addEventListener('mouseup', updateToolbarState);
        box.addEventListener('keyup', updateToolbarState);
        box.addEventListener('focus', updateToolbarState);
        box.addEventListener('blur', updateToolbarState);
        // Für kontinuierliche Updates beim Bewegen des Cursors oder der Auswahl
        box.addEventListener('selectionchange', updateToolbarState); // Kann auf dem document sein, aber hier auch ok
    });

    // Initialen Entwurf laden, falls bereits etwas gespeichert ist, wenn der Editor zum ersten Mal geladen wird
    loadSavedDraft();
    updateToolbarState(); // Initialen Toolbar-Status setzen
}

// Stelle sicher, dass die Funktion global verfügbar ist
window.initEditorPage = initEditorPage;