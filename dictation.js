// dictation.js

let recognition; // Variable für SpeechRecognition-Instanz
let finalTranscript = ''; // Speichert das finale Transkript
let currentPatient = null; // Variable, um den aktuellen Patienten zu speichern

function initDictationPage() {
    console.log("initDictationPage called for browser dictation.");

    const currentPatientNameElem = document.getElementById('currentPatientName');
    const startDictationBtn = document.getElementById('startDictationBtn');
    const stopDictationBtn = document.getElementById('stopDictationBtn');
    const cancelDictationBtn = document.getElementById('cancelDictationBtn');
    const dictationStatus = document.getElementById('dictationStatus');
    const transcribedTextOutput = document.getElementById('transcribedTextOutput');
    const saveAnamnesisBtn = document.getElementById('saveAnamnesisBtn');

    // Lade den aktuellen Patienten
    currentPatient = patientStore.getCurrentPatient();
    if (currentPatient) {
        currentPatientNameElem.textContent = `${currentPatient.first} ${currentPatient.last}`;
        // Speichern-Button nur anzeigen, wenn ein Patient ausgewählt ist
        saveAnamnesisBtn.style.display = 'block';
    } else {
        currentPatientNameElem.textContent = "Kein Patient ausgewählt. Speichern nicht möglich.";
        // Deaktiviere Diktat und Speichern, wenn kein Patient
        startDictationBtn.disabled = true;
        saveAnamnesisBtn.style.display = 'none';
    }

    // Prüfen, ob der Browser die Web Speech API unterstützt
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        dictationStatus.textContent = "Ihr Browser unterstützt keine Spracherkennung. Bitte nutzen Sie Google Chrome oder einen kompatiblen Browser.";
        startDictationBtn.disabled = true;
        return;
    }

    // Initialisiere SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true; // Durchgehende Erkennung
    recognition.interimResults = true; // Zeige Zwischenergebnisse
    recognition.lang = 'de-DE'; // Sprache auf Deutsch setzen

    recognition.onstart = () => {
        dictationStatus.textContent = "Aufnahme läuft... Bitte sprechen Sie.";
        startDictationBtn.style.display = 'none';
        stopDictationBtn.style.display = 'inline-block';
        cancelDictationBtn.style.display = 'inline-block';
        saveAnamnesisBtn.style.display = 'none'; // Speichern-Button verstecken
        transcribedTextOutput.value = ''; // Textfeld leeren
        finalTranscript = '';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        transcribedTextOutput.value = finalTranscript + interimTranscript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        dictationStatus.textContent = `Fehler bei der Spracherkennung: ${event.error}.`;
        startDictationBtn.style.display = 'inline-block';
        stopDictationBtn.style.display = 'none';
        cancelDictationBtn.style.display = 'none';
        // Speichern-Button nur anzeigen, wenn schon etwas final transkribiert wurde
        if (finalTranscript.trim() !== '' && currentPatient) {
            saveAnamnesisBtn.style.display = 'block';
        }
    };

    recognition.onend = () => {
        dictationStatus.textContent = "Aufnahme beendet.";
        startDictationBtn.style.display = 'inline-block';
        stopDictationBtn.style.display = 'none';
        cancelDictationBtn.style.display = 'none';
        // Speichern-Button nur anzeigen, wenn etwas final transkribiert wurde
        if (finalTranscript.trim() !== '' && currentPatient) {
            saveAnamnesisBtn.style.display = 'block';
        }
        transcribedTextOutput.value = finalTranscript; // Finales Transkript ins Feld
    };

    startDictationBtn.onclick = () => {
        if (!currentPatient) {
            alert('Bitte wählen Sie zuerst einen Patienten aus der Startseite aus.');
            return;
        }
        try {
            recognition.start();
        } catch (e) {
            console.error("Error starting recognition:", e);
            dictationStatus.textContent = "Fehler beim Starten der Aufnahme. Ist das Mikrofon verfügbar?";
        }
    };

    stopDictationBtn.onclick = () => {
        recognition.stop();
        dictationStatus.textContent = "Aufnahme wird beendet...";
    };

    cancelDictationBtn.onclick = () => {
        recognition.stop(); // Stoppt die Erkennung
        finalTranscript = ''; // Löscht das bisherige Transkript
        transcribedTextOutput.value = ''; // Leert das Textfeld
        dictationStatus.textContent = "Aufnahme abgebrochen.";
        startDictationBtn.style.display = 'inline-block';
        stopDictationBtn.style.display = 'none';
        cancelDictationBtn.style.display = 'none';
        saveAnamnesisBtn.style.display = 'none';
    };

    saveAnamnesisBtn.onclick = () => {
        if (!currentPatient) {
            alert('Kein Patient ausgewählt. Speichern nicht möglich.');
            return;
        }

        const dictationText = transcribedTextOutput.value.trim();

        if (dictationText === '') {
            alert('Es wurde kein Text transkribiert, um ihn zu speichern.');
            return;
        }

        const anamnesisEntry = `
--- Diktat vom ${new Date().toLocaleString()} ---
${dictationText}
--- Ende Diktat ---
\n\n`; // Fügt zwei Zeilenumbrüche am Ende hinzu für bessere Lesbarkeit

        // Füge den Text zur bestehenden Anamnese hinzu
        currentPatient.sections.anamnesis = (currentPatient.sections.anamnesis || '') + anamnesisEntry;
        patientStore.updatePatient(currentPatient); // Speichern in patientStore

        alert('Diktat erfolgreich der Anamnese hinzugefügt!');
        // Optional: Zur Anamnese-Seite wechseln
        loadContent('anamnesis.html', initAnamnesisPage);
    };

    // Initialen Status setzen
    dictationStatus.textContent = "Bereit für die Aufnahme. Bitte erlauben Sie den Mikrofonzugriff.";
    transcribedTextOutput.value = "";
}

// Globalisieren der Init-Funktion, damit index.html sie aufrufen kann
window.initDictationPage = initDictationPage;