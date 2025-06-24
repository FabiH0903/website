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

    // Toolbar-Elemente
    const editorToolbar = document.getElementById('editorToolbar');
    const fontSelect = document.getElementById('fontSelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const foreColorPicker = document.getElementById('foreColorPicker');
    const backColorPicker = document.getElementById('backColorPicker');

    const patient = patientStore.getCurrentPatient(); // Assuming patientStore is globally available

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
    function loadKiDraft() {
        if (!patient) {
            alert('Please select a patient on the "General Information" page first to load an AI draft.');
            return;
        }

        // Default values for patient data if not available
        const patientName = `${patient.first || '[Vorname]'} ${patient.last || '[Nachname]'}`;
        const patientDob = patient.dob || '[DD.MM.YYYY]';
        const patientId = patient.id || '[Patienten-ID]';
        const patientGender = patient.gender || '[Geschlecht]';
        const patientContact = patient.contact || '[Kontaktinformation]';
        const patientCity = patient.city || '[Stadt]';
        const patientBirthplace = patient.birthplace || '[Geburtsort]';
        const patientInsurance = patient.insurance || '[Krankenkasse]';
        const preliminaryDiagnosis = patient.diagnosis || '[Vorläufige Diagnose]'; // From general info
        const currentHistory = patient.history || '[Aktuelles Krankheitsbild]'; // From general info
        const pastTreatments = patient.treatments || '[Bisherige Behandlungen]'; // From general info

        // Example "flowing" text for the different sections
        const exampleHeader = `
            ${patientName}, geboren am ${patientDob} (ID: ${patientId})\n
            Kontakt: ${patientContact}\n
            Wohnort: ${patientCity}, Geburtsort: ${patientBirthplace}\n
            Krankenkasse: ${patientInsurance}\n
            \n
            <b>Betreff:</b> Arztbrief für ${patientName} nach stationärem Aufenthalt\n
            \n
            Sehr geehrte Kolleginnen und Kollegen,
            \n
            wir berichten über Herrn/Frau ${patientName}, der/die vom ${new Date().toLocaleDateString('de-DE')} bis ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')} in unserer Klinik für [Fachbereich, z.B. Innere Medizin] aufgrund von ${currentHistory.toLowerCase()} stationär behandelt wurde.
        `;

        const exampleAnamnesis = `
            <b><u>Anamnese:</u></b>\n
            Der/Die Patient/in stellte sich mit seit [Dauer, z.B. 3 Tagen] bestehenden Beschwerden im Sinne von ${currentHistory.toLowerCase()} vor. Begleitend traten [weitere Symptome, z.B. Fieber bis 38.5°C, Schüttelfrost, ausgeprägtes Krankheitsgefühl] auf. Die Vorerkrankungen umfassen [relevante Vorerkrankungen, z.B. arterielle Hypertonie, Diabetes mellitus Typ 2]. Aktuelle Medikation: [Liste aktueller Medikamente]. Allergien: [Bekannte Allergien, z.B. Penicillin]. Sozialanamnese: [Kurze Angaben zur Sozialanamnese]. Familienanamnese: [Kurze Angaben zur Familienanamnese]. Frühere Behandlungen für ähnliche Beschwerden: ${pastTreatments}.
        `;

        const exampleDiagnosis = `
            <b><u>Diagnose:</u></b>\n
            Wir diagnostizierten bei Herrn/Frau ${patientName} eine/n <b>${preliminaryDiagnosis || 'akute Tonsillitis'}</b> (ICD-10: J03.9), bestätigt durch die klinische Symptomatik und die bei uns erhobenen Befunde. Als Nebendiagnose wurde eine leichte Exsikkose (E86.0) aufgrund reduzierter Trinkmengen festgestellt. Differentialdiagnostisch wurden ein Peritonsillarabszess und eine infektiöse Mononukleose erwogen, konnten aber weitgehend ausgeschlossen werden.
        `;

        const exampleFindings = `
            <b><u>Befunde:</u></b>\n
            Bei Aufnahme präsentierte sich der/die Patient/in in reduziertem Allgemeinzustand, jedoch bei klarem Bewusstsein und orientiert. Die körperliche Untersuchung zeigte [wichtige körperliche Befunde, z.B. stark geröteten Pharynx mit beidseitigem eitrigem Exsudat an den Tonsillen, zervikale Lymphadenopathie bds.]. Vitalparameter: [z.B. RR 125/85 mmHg, Puls 78/min, AF 14/min, Temp 37.8°C]. Laborchemisch fielen auf: [wichtige Laborwerte, z.B. CRP 85 mg/L (Ref: <5), Leukozyten 14.5 G/L (Ref: 4-10)]. Ein Schnelltest auf Streptokokken war negativ. Bildgebende Diagnostik wurde nicht durchgeführt.
        `;

        const exampleTherapy = `
            <b><u>Therapie und Medikation:</u></b>\n
            Die Therapie erfolgte konservativ und symptomatisch. Der/Die Patient/in erhielt [Medikament 1, z.B. Ibuprofen 400mg 1-1-1 bei Bedarf] zur Schmerz- und Fieberkontrolle sowie [Medikament 2, z.B. Paracetamol 500mg bei Bedarf] und [weitere Maßnahmen, z.B. ausreichend Flüssigkeitszufuhr, Gurgeln mit Salbeilösung]. Eine antibiotische Therapie wurde nach Ausschluss einer bakteriellen Superinfektion nicht initiiert.
        `;

        const examplePrognosis = `
            <b><u>Prognose und weiteres Vorgehen:</u></b>\n
            Unter der eingeleiteten Therapie zeigte sich eine rasche Besserung des Allgemeinzustandes und der lokalen Symptomatik. Der/Die Patient/in wurde heute in gutem Allgemeinzustand entlassen. Wir empfehlen die Fortführung der symptomatischen Therapie für weitere [Dauer, z.B. 3-5 Tage] und eine Wiedervorstellung beim Hausarzt in [Dauer, z.B. 7 Tagen] zur Kontrolle des Verlaufs und Ausschluss von Komplikationen. Bei Verschlechterung des Zustandes oder Auftreten neuer Symptome bitten wir um umgehende erneute Vorstellung.
        `;

        const exampleClosing = `
            Mit freundlichen Grüßen,\n
            \n
            Dr. [Name des behandelnden Arztes/Ärztin]\n
            [Name der Klinik/Praxis]\n
            Datum: ${new Date().toLocaleDateString('de-DE')}
        `;

        editorHeader.innerHTML = exampleHeader.trim();
        editorAnamnesis.innerHTML = exampleAnamnesis.trim();
        editorDiagnosis.innerHTML = exampleDiagnosis.trim();
        editorFindings.innerHTML = exampleFindings.trim();
        editorTherapy.innerHTML = exampleTherapy.trim();
        editorPrognosis.innerHTML = examplePrognosis.trim();
        editorClosing.innerHTML = exampleClosing.trim();

        alert('Beispiel-Arztbrief-Entwurf geladen. Bitte überprüfen und anpassen.');
        updateToolbarState(); // Toolbar-Status nach dem Laden aktualisieren
    }
    // Funktion zum Speichern des Entwurfs (im Browser-Speicher)
    function saveDraft() {
        if (!patient) {
            alert('Kein Patient ausgewählt. Entwurf kann nicht gespeichert werden.');
            return;
        }

        // Store HTML content of each editable box
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

    // Funktion zum Laden eines gespeicherten Entwurfs
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
                alert('Gespeicherter Entwurf konnte nicht vollständig geladen werden (möglicherweise altes Format oder Fehler beim Parsen).');
            }
        } else if (patient) {
             // If no specific letterDraft exists, but patient is selected, load some initial AI content
             loadKiDraft(); // Load an example AI draft
        }
    }


    // Funktion zum Drucken / Exportieren als PDF
    function printDraft() {
        window.print();
    }

    // Funktion zum Exportieren als reiner Text
    function exportText() {
        let fullText = '';
        const sections = [
            { label: 'Briefkopf & Patientendaten', element: editorHeader },
            { label: 'Anamnese', element: editorAnamnesis },
            { label: 'Diagnose', element: editorDiagnosis },
            { label: 'Befunde', element: editorFindings },
            { label: 'Therapie & Medikation', element: editorTherapy },
            { label: 'Prognose & Weiteres Vorgehen', element: editorPrognosis },
            { label: 'Schlussformel & Unterschrift', element: editorClosing }
        ];

        sections.forEach(section => {
            const content = section.element.innerText.trim();
            if (content) {
                fullText += `--- ${section.label} ---\n${content}\n\n`;
            }
        });

        if (fullText) {
            const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            const patientNameForFile = patient ? `${patient.first || 'Unbekannt'}_${patient.last || 'Patient'}` : 'Arztbrief';
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

    // Event Listener für die Toolbar-Buttons
    if (editorToolbar) {
        editorToolbar.addEventListener('click', (event) => {
            const target = event.target.closest('.toolbar-btn'); // Nutze closest, um auch Kind-Elemente zu treffen
            if (target && target.dataset.command) {
                executeCommand(target.dataset.command);
            }
        });
    }

    // Event Listener für Schriftart-Dropdown
    if (fontSelect) {
        fontSelect.addEventListener('change', (event) => {
            executeCommand('fontname', event.target.value);
        });
    }

    // Event Listener für Schriftgröße-Dropdown
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (event) => {
            executeCommand('fontsize', event.target.value);
        });
    }

    // Event Listener für Textfarbe
    if (foreColorPicker) {
        foreColorPicker.addEventListener('input', (event) => { // 'input' für Echtzeit-Update beim Ziehen
            executeCommand('forecolor', event.target.value);
        });
        foreColorPicker.addEventListener('change', (event) => { // 'change' für finales Update
             executeCommand('forecolor', event.target.value);
             updateToolbarState(); // Toolbar-Status nach Farbwahl aktualisieren
        });
    }

    // Event Listener für Hintergrundfarbe
    if (backColorPicker) {
        backColorPicker.addEventListener('input', (event) => {
            executeCommand('backcolor', event.target.value);
        });
        backColorPicker.addEventListener('change', (event) => {
            executeCommand('backcolor', event.target.value);
            updateToolbarState(); // Toolbar-Status nach Farbwahl aktualisieren
        });
    }

    // Event Listener für alle editable-boxes, um den Toolbar-Status zu aktualisieren
    // Wenn der Fokus wechselt oder sich die Auswahl ändert
    document.querySelectorAll('.editable-box').forEach(box => {
        box.addEventListener('mouseup', updateToolbarState);
        box.addEventListener('keyup', updateToolbarState);
        box.addEventListener('focus', updateToolbarState);
        box.addEventListener('blur', updateToolbarState);
        // Für kontinuierliche Updates beim Bewegen des Cursors oder der Auswahl
        box.addEventListener('selectionchange', updateToolbarState); // Kann auf dem document sein, aber hier auch ok
    });

    // Event Listener für die rechte Sidebar, um beim Klick auf ein Referenz-Element
    // das entsprechende Editor-Feld zu scrollen oder hervorzuheben.
    const editorSidebarRight = document.getElementById('editorSidebarRight');
    if (editorSidebarRight) {
        editorSidebarRight.addEventListener('click', (event) => {
            const refItem = event.target.closest('.ref-item');
            if (refItem && refItem.dataset.section) {
                const targetId = refItem.dataset.section;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Optional: Kurzes Blinken oder Hervorheben des Elements
                    targetElement.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
                    targetElement.style.border = '1px dashed #e85d75'; // Temporäres Highlight
                    targetElement.style.boxShadow = '0 0 0 5px rgba(232, 93, 117, 0.4)';
                    setTimeout(() => {
                        targetElement.style.border = '1px solid transparent'; // Reset after a short delay
                        targetElement.style.boxShadow = '';
                    }, 1000);
                }
            }
        });
    }

    // Initialen Entwurf laden, falls bereits etwas gespeichert ist, wenn der Editor zum ersten Mal geladen wird
    // If there is a current patient and a saved letter draft, load it. Otherwise, load a new AI draft.
    if (patientStore.getCurrentPatient() && patientStore.getCurrentPatient().sections.letterDraft) {
        loadSavedDraft();
    } else {
        loadKiDraft(); // Load an example AI draft if no patient or no saved draft
    }
    updateToolbarState(); // Initialen Toolbar-Status setzen
}

// Stelle sicher, dass die Funktion global verfügbar ist
window.initEditorPage = initEditorPage;