// index.js

/**
 * Lädt den HTML-Inhalt einer Seite in den 'main-content' Bereich
 * und ruft optional eine Initialisierungsfunktion für die geladene Seite auf.
 * @param {string} page - Der Dateipfad der zu ladenden HTML-Seite.
 * @param {function|string} [initFunction] - Eine optionale Funktion oder der Name der Funktion,
 * die nach dem Laden des Inhalts ausgeführt wird.
 */
function loadContent(page, initFunction) {
    fetch(page)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const mainContent = document.querySelector('.main-content');
            mainContent.innerHTML = html;

            // Rufe die spezifische Initialisierungsfunktion für die geladene Seite auf.
            // Überprüfe, ob initFunction ein String ist und versuche, die globale Funktion zu finden.
            let actualInitFunction = null;
            if (typeof initFunction === 'string' && typeof window[initFunction] === 'function') {
                actualInitFunction = window[initFunction];
            } else if (typeof initFunction === 'function') {
                actualInitFunction = initFunction;
            }

            if (actualInitFunction) {
                actualInitFunction();
            }
        })
        .catch(error => {
            document.querySelector('.main-content').innerHTML = '<p>Fehler beim Laden der Seite.</p>';
            console.error("Fehler beim Laden des Inhalts:", error);
        });
}

/**
 * Schaltet die Sichtbarkeit des Kopfleisten-Menüs um.
 */
function toggleMenu() {
    const menu = document.getElementById("menuDropdown");
    if (menu) {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    }
}

// Schließt das Menü, wenn außerhalb geklickt wird
window.onclick = function(e) {
    // Überprüfe, ob der Klick NICHT auf dem Menü-Umschalter oder innerhalb des Dropdowns war
    const menuToggle = document.querySelector('.menu-toggle');
    const menuDropdown = document.getElementById("menuDropdown");

    if (menuToggle && menuDropdown && menuDropdown.style.display === "block") {
        if (!menuToggle.contains(e.target) && !menuDropdown.contains(e.target)) {
            menuDropdown.style.display = "none";
        }
    }
}

// Beim Laden der Seite (DOM ready) die Standardseite laden und Event-Listener hinzufügen
document.addEventListener('DOMContentLoaded', () => {
    // Füge Event-Listener für alle Navigations-Buttons hinzu
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Verhindert das Standardverhalten des Links
            const page = button.dataset.page;
            const initFunction = button.dataset.initFunction; // Holt den Funktionsnamen als String
            if (page && initFunction) {
                loadContent(page, initFunction); // Übergibt den Funktionsnamen an loadContent
            } else if (page) {
                loadContent(page, null); // Falls keine Init-Funktion definiert ist
            }
        });
    });

    // Lädt "General Information" als Startseite
    // Da initGeneralInfoPage direkt in index.html geladen wird, ist es bei DOMContentLoaded verfügbar.
    loadContent('general-info.html', 'initGeneralInfoPage'); // Übergibt den Funktionsnamen als String
});