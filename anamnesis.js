// anamnesis.js

let currentAnamnesisPatient = null;

function initAnamnesisPage() {
    console.log("initAnamnesisPage called.");

    const anamnesisPatientNameElem = document.getElementById('anamnesisPatientName');
    const anamnesisContentElem = document.getElementById('anamnesisContent');
    const saveAnamnesisContentBtn = document.getElementById('saveAnamnesisContentBtn');

    currentAnamnesisPatient = patientStore.getCurrentPatient();

    if (currentAnamnesisPatient) {
        anamnesisPatientNameElem.textContent = `${currentAnamnesisPatient.first} ${currentAnamnesisPatient.last}`;
        anamnesisContentElem.value = currentAnamnesisPatient.sections.anamnesis || '';
        anamnesisContentElem.disabled = false; // Textarea aktivieren
        saveAnamnesisContentBtn.disabled = false;
    } else {
        anamnesisPatientNameElem.textContent = "Kein Patient ausgewählt.";
        anamnesisContentElem.value = "Bitte wählen Sie zuerst einen Patienten aus.";
        anamnesisContentElem.disabled = true; // Textarea deaktivieren
        saveAnamnesisContentBtn.disabled = true;
    }

    saveAnamnesisContentBtn.onclick = () => {
        if (currentAnamnesisPatient) {
            currentAnamnesisPatient.sections.anamnesis = anamnesisContentElem.value;
            patientStore.updatePatient(currentAnamnesisPatient);
            alert('Anamnese erfolgreich gespeichert!');
        }
    };
}

// Globalisieren der Init-Funktion
window.initAnamnesisPage = initAnamnesisPage;