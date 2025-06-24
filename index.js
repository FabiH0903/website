// index.js

/**
 * Lädt den HTML-Inhalt einer Seite in den 'main-content' Bereich
 * und ruft optional eine Initialisierungsfunktion für die geladene Seite auf.
 * @param {string} pageUrl - Der Dateipfad der zu ladenden HTML-Seite (z.B. 'general-info.html').
 * @param {string} [initFunctionName] - Der Name der global verfügbaren Initialisierungsfunktion,
 * die nach dem Laden des Inhalts und des zugehörigen Skripts ausgeführt wird.
 */
async function loadPage(pageUrl, initFunctionName) {
    const mainContentDiv = document.querySelector('.main-content');
    if (!mainContentDiv) {
        console.error("Main content div not found.");
        return;
    }

    try {
        // 1. Fetch HTML content
        const htmlResponse = await fetch(pageUrl);
        if (!htmlResponse.ok) {
            throw new Error(`HTTP error! status: ${htmlResponse.status}`);
        }
        const htmlContent = await htmlResponse.text();

        // 2. Clear existing content and inject new HTML
        mainContentDiv.innerHTML = htmlContent;

        // 3. Dynamically load page-specific CSS (if needed and not already loaded)
        // This assumes CSS files are named similarly (e.g., general-info.css for general-info.html)
        const cssUrl = pageUrl.replace('.html', '.css');
        if (!document.querySelector(`link[href="${cssUrl}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            link.onload = () => console.log(`Loaded CSS: ${cssUrl}`);
            link.onerror = () => console.error(`Failed to load CSS: ${cssUrl}`);
            document.head.appendChild(link);
        }

        // 4. Dynamically load page-specific JavaScript
        // This is crucial: Scripts embedded in innerHTML are NOT executed.
        const scriptUrl = pageUrl.replace('.html', '.js');

        // Only load if it's not one of the main, always-loaded scripts
        if (scriptUrl !== 'index.js' && scriptUrl !== 'common.js' && scriptUrl !== 'patient-store.js') {
            // Remove any previously loaded version of this specific page script
            // to ensure a fresh execution, especially important if init functions
            // are defined globally and might retain old state or listeners.
            const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true; // Non-blocking load
            script.onload = () => {
                console.log(`Loaded JS: ${scriptUrl}`);
                // 5. Call the initialization function AFTER the script is loaded
                if (initFunctionName && typeof window[initFunctionName] === 'function') {
                    window[initFunctionName]();
                } else if (initFunctionName) {
                    console.warn(`Initialization function "${initFunctionName}" not found or not a function for ${pageUrl}.`);
                }
            };
            script.onerror = () => {
                console.error(`Failed to load JS: ${scriptUrl}.`);
            };
            document.body.appendChild(script); // Append to body to ensure it executes
        } else {
            // If it's a page that doesn't have a dedicated JS file (or the JS is already loaded)
            // just call the init function if it exists.
            if (initFunctionName && typeof window[initFunctionName] === 'function') {
                window[initFunctionName]();
            } else if (initFunctionName) {
                console.warn(`Initialization function "${initFunctionName}" not found or not a function for ${pageUrl}.`);
            }
        }

        // Update active navigation button visual
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-button[data-page="${pageUrl}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        console.log(`Content for ${pageUrl} loaded.`);

    } catch (error) {
        mainContentDiv.innerHTML = '<p>Fehler beim Laden der Seite.</p>';
        console.error("Fehler beim Laden des Inhalts:", error);
    }
}

// Global function to toggle the header menu (not inline in HTML anymore)
function toggleMenu() {
    const menu = document.getElementById("menuDropdown");
    if (menu) {
        const isHidden = menu.style.display === "none" || menu.style.display === "";
        menu.style.display = isHidden ? "block" : "none";
        menu.setAttribute('aria-hidden', !isHidden);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Event listener for the menu toggle button
    const menuToggleBtn = document.getElementById('menuToggleBtn'); // Assuming you add id="menuToggleBtn" to your button
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleMenu);
    }

    // Close the menu when clicking outside
    document.addEventListener('click', (e) => {
        const menuToggle = document.getElementById('menuToggleBtn'); // Use ID for consistency
        const menuDropdown = document.getElementById("menuDropdown");

        if (menuToggle && menuDropdown && menuDropdown.style.display === "block") {
            if (!menuToggle.contains(e.target) && !menuDropdown.contains(e.target)) {
                menuDropdown.style.display = "none";
                menuDropdown.setAttribute('aria-hidden', 'true');
            }
        }
    });

    // Add Event-Listener for all Navigation-Buttons
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const page = button.dataset.page;
            const initFunction = button.dataset.initFunction;

            if (page) { // Always pass initFunction, even if null/undefined
                loadPage(page, initFunction);
            }
        });
    });

    // Load "General Information" as the starting page on initial load
    // This will trigger the dynamic loading process.
    loadPage('general-info.html', 'initGeneralInfoPage');
});

// Define dummy init functions for pages that don't have a dedicated JS file yet,
// or if their JS is not dynamically loaded (e.g., very simple HTML pages).
// Ideally, these would be defined in their own script files that are loaded by loadPage.
window.initAnamnesisPage = function() { console.log('Anamnesis Page initialized'); };
window.initDiagnosisPage = function() { console.log('Diagnosis Page initialized'); };
window.initDictationPage = function() { console.log('Dictation Page initialized'); };
window.initEditorPage = function() { console.log('Editor Page initialized'); };
window.initTemplatesPage = function() { console.log('Templates Page initialized'); };
window.initTreatmentPlanPage = function() { console.log('Treatment Plan Page initialized'); };
window.initDiagnosisSummaryPage = function() { console.log('Diagnosis Summary Page initialized'); };
window.initLetterDraftPage = function() { console.log('Letter Draft Page initialized'); };
window.initReviewPage = function() { console.log('Review Page initialized'); };
window.initExportPage = function() { console.log('Export Page initialized'); };