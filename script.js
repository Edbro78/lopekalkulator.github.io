// --- DOM Elementer ---
const form = document.getElementById('calculator-form');
const distanceSelect = document.getElementById('distance-select');
const customDistanceContainer = document.getElementById('custom-distance-container');
const customDistanceInput = document.getElementById('custom-distance');
const elevationInput = document.getElementById('elevation');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const negativeSplitToggle = document.getElementById('negative-split-toggle');
const errorMessageDiv = document.getElementById('error-message');
const resultsSection = document.getElementById('results-section');
// Andre element-referanser er ikke nødvendige for denne testen
const paceResultSpan = document.getElementById('pace-result');
const adjustedPaceResultSpan = document.getElementById('adjusted-pace-result');
const adjustedPaceNoteSpan = document.getElementById('adjusted-pace-note');
const lapTimeResultSpan = document.getElementById('lap-time-result');
const speedResultSpan = document.getElementById('speed-result');
const time800mResultSpan = document.getElementById('time-800m-result');
const time200mResultSpan = document.getElementById('time-200m-result');
const negativeSplitPacesInfoDiv = document.getElementById('negative-split-paces-info');
const paceFirstHalfSpan = document.getElementById('pace-first-half');
const paceSecondHalfSpan = document.getElementById('pace-second-half');
const splitsContainer = document.getElementById('splits-container');
const splitsTitle = document.getElementById('splits-title');
const splitsTitleText = document.getElementById('splits-title-text');
const splitsHeader = document.getElementById('splits-header');
const splitsCol2Title = document.getElementById('splits-col2-title');
const splitsCol3Title = document.getElementById('splits-col3-title');
const splitsListDiv = document.getElementById('splits-list');
const splitsNote = document.getElementById('splits-note');
const intervalSectionDiv = document.getElementById('interval-section');
const intervalBasisDistanceSpan = document.getElementById('interval-basis-distance');
const intervalBasisTimeSpan = document.getElementById('interval-basis-time');
const estimatedHmTimeSpan = document.getElementById('estimated-hm-time');
const estimatedHmPaceSpan = document.getElementById('estimated-hm-pace');
const recommendedIntervalPaceSpan = document.getElementById('recommended-interval-pace');
const predictionsGridDiv = document.getElementById('predictions-grid');


// --- Konstanter ---
// (Disse kan stå, trengs ikke for denne testen)
const RIEGEL_EXPONENT = 1.06;
const ELEVATION_ADJUSTMENT_FACTOR = 10;
const NEGATIVE_SPLIT_FACTOR = 0.02;
const HALF_MARATHON_KM = 21.0975;
const INTERVAL_PACE_ADJUSTMENT = 5;
const PREDICTION_DISTANCES = [
    { name: '400 m', value: 0.4 }, { name: '1500 m', value: 1.5 }, { name: '3 km', value: 3 },
    { name: '5 km', value: 5 }, { name: '10 km', value: 10 }, { name: '15 km', value: 15 },
    { name: 'Halvmaraton', value: HALF_MARATHON_KM }, { name: 'Maraton', value: 42.195 }
];

// --- Hjelpefunksjoner (kun de nødvendige for testen) ---
/** Viser en feilmelding/testmelding til brukeren. */
function showTestMessage(message, isError = false) {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.color = isError ? 'red' : 'green'; // Rød for feil, grønn for test OK
    } else {
        console.error("FEIL: errorMessageDiv ikke funnet! Melding:", message);
    }
    if (resultsSection) {
        resultsSection.classList.add('hidden'); // Skjul resultatseksjonen
    }
}

/** Viser en feilmelding til brukeren (brukes av validering). */
function showError(message) {
    showTestMessage(message, true); // Kall showTestMessage med isError=true
}


/** Fjerner feilmeldingen/testmeldingen. */
function clearError() {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.color = 'red'; // Tilbakestill til rød for faktiske feil
    }
}

/** Skjuler resultatseksjonen */
function hideResults() {
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
    // Trenger ikke tømme alle feltene for denne testen
}

// --- Event Listener ---

/**
 * Håndterer innsending av skjemaet.
 * TESTER NÅ MED INPUT-HENTING OG VALIDERING.
 * @param {Event} event - Skjemaets submit-event.
 */
function handleFormSubmit(event) {
    console.log("--- handleFormSubmit (Test med Validering) startet ---"); // Debugging
    if (!event || typeof event.preventDefault !== 'function') {
        console.error("handleFormSubmit ble kalt uten et gyldig event-objekt!");
        return;
    }
    event.preventDefault(); // Forhindrer standard skjemainnsending
    console.log("preventDefault kalt"); // Debugging
    clearError();
    hideResults();

    // RE-AKTIVERT: Henting av input og validering
    try {
        console.log("Henter input..."); // Debugging
        const distanceKm = getSelectedDistance();
        const elevationM = getElevation();
        const timeInputs = getTimeInputs();
        const useNegativeSplit = negativeSplitToggle ? negativeSplitToggle.checked : false;

        console.log("Input hentet:", { distanceKm, elevationM, timeInputs, useNegativeSplit }); // Debugging

        console.log("Starter validering...");
        if (!validateInputs(distanceKm, elevationM, timeInputs)) {
            console.log("Validering feilet (som forventet hvis input er ugyldig)."); // Debugging
            // showError er kalt inne i validateInputs
            return; // Stopp hvis validering feiler
        }
        console.log("Validering OK"); // Debugging

        // Vis en melding om at valideringen var vellykket
        showTestMessage("Test OK: Validering fullført uten feil.");

        // MIDLERTIDIG: Kalkulering og visning er fortsatt kommentert ut
        /*
        const totalSeconds = calculateTotalSeconds(timeInputs);
        console.log("TotalSeconds beregnet:", totalSeconds); // Debugging

        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
            showError("Total tid må være et positivt tall.");
            console.log("Feil: Total tid er 0, negativ eller ikke et tall"); // Debugging
            return;
        }

        console.log("Starter performCalculations..."); // Debugging
        const calculations = performCalculations(distanceKm, elevationM, totalSeconds);
        console.log("Calculations fullført:", calculations); // Debugging

        if (!Number.isFinite(calculations.avgActualPaceSecondsPerKm) ||
            !Number.isFinite(calculations.avgAdjustedPaceSecondsPerKm) ||
            !Number.isFinite(calculations.speedKph)) {
            showError("Kunne ikke beregne nøkkelresultater (pace/fart). Sjekk inputverdiene.");
            console.log("Feil: Ugyldige nøkkelberegningsresultater (NaN/Infinity)"); // Debugging
            return;
        }
        console.log("Nøkkelberegninger er gyldige (Finite)"); // Debugging

        console.log("Starter displayResults..."); // Debugging
        displayResults(calculations, distanceKm, totalSeconds, elevationM > 0, useNegativeSplit, timeInputs);
        console.log("displayResults fullført."); // Debugging
        */

    } catch (error) {
        console.error("En uventet feil oppstod i handleFormSubmit (etter validering?):", error); // Logg feilen
        showError(`En uventet feil oppstod: ${error.message}`, true); // Vis feilmelding
    }

    console.log("--- handleFormSubmit (Test med Validering) ferdig ---");
    // Vi trenger ikke 'return false' her lenger siden preventDefault fungerer
}

// --- Funksjoner for input-henting og validering (fra forrige versjon) ---

/**
 * Håndterer endring i distanse-nedtrekksmenyen.
 */
function handleDistanceChange() {
    if (distanceSelect && customDistanceContainer && customDistanceInput) {
        if (distanceSelect.value === 'custom') {
            customDistanceContainer.classList.remove('hidden');
            customDistanceInput.required = true;
            setTimeout(() => customDistanceInput.focus(), 0);
        } else {
            customDistanceContainer.classList.add('hidden');
            customDistanceInput.required = false;
            customDistanceInput.value = '';
        }
        clearError();
        hideResults();
    } else {
        console.error("FEIL: Mangler elementer for distanseendring.");
    }
}

/**
 * Henter den valgte eller egendefinerte distansen i kilometer.
 */
function getSelectedDistance() {
    if (!distanceSelect) return NaN;
    const selection = distanceSelect.value;
    if (selection === 'custom') {
        if (!customDistanceInput) return NaN;
        const customValue = customDistanceInput.value.trim().replace(',', '.');
        return parseFloat(customValue);
    }
    if (selection === 'preset') return NaN;
    return parseFloat(selection);
}

/**
 * Henter antall høydemeter fra input-feltet.
 */
function getElevation() {
    if (!elevationInput) return NaN;
    const elevationStr = elevationInput.value.trim().replace(',', '.') || '0';
    return parseFloat(elevationStr);
}

/**
 * Henter verdiene fra tid-inputfeltene.
 */
function getTimeInputs() {
    if (!hoursInput || !minutesInput || !secondsInput) {
        console.error("FEIL: Mangler tid-input elementer.");
        return null;
    }
    const secondsStr = secondsInput.value.trim().replace(',', '.') || '0';
    return {
        hours: hoursInput.value.trim() || '0',
        minutes: minutesInput.value.trim() || '0',
        seconds: secondsStr
    };
}

/**
 * Validerer inputverdiene.
 */
function validateInputs(distanceKm, elevationM, timeInputs) {
     console.log("Validerer:", { distanceKm, elevationM, timeInputs });
     if (distanceSelect && distanceSelect.value === 'preset') {
         showError("Vennligst velg en distanse.");
         return false;
     }
     if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
         showError("Ugyldig eller manglende distanse. Bruk punktum for desimaler.");
         return false;
     }
     if (!Number.isFinite(elevationM) || elevationM < 0) {
         showError("Ugyldig verdi for høydemeter (må være 0 eller positiv).");
         return false;
     }
     if (!timeInputs) {
         showError("Klarte ikke hente tidsverdier.");
         return false;
     }
     const hours = parseFloat(timeInputs.hours);
     const minutes = parseFloat(timeInputs.minutes);
     const seconds = parseFloat(timeInputs.seconds);
     console.log("Parsede tider for validering:", { hours, minutes, seconds });
     if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
         showError("Tidsfeltene må inneholde gyldige tall. Bruk punktum for desimaler i sekunder.");
         return false;
     }
     if (hours < 0 || minutes < 0 || seconds < 0) {
         showError("Tidsverdier kan ikke være negative.");
         return false;
     }
     if (Math.floor(minutes) >= 60) {
        showError("Minutter må være under 60.");
        return false;
     }
     if (seconds >= 60) { // Sekunder må være strengt mindre enn 60
        showError("Sekunder må være under 60.");
        return false;
     }
     console.log("Validering fullført OK.");
     return true; // Alt er gyldig
}


// --- Kalkulerings- og visningsfunksjoner (fortsatt ikke i bruk) ---
// La disse funksjonene ligge her, men de vil ikke bli kalt ennå.
function calculateTotalSeconds(timeInputs) { /* ... kode ... */ return NaN; }
function performCalculations(distanceKm, elevationM, totalSeconds) { /* ... kode ... */ return {}; }
function displayResults(calculations, distanceKm, totalSeconds, hasElevation, useNegativeSplit, originalTimeInputs) { /* ... kode ... */ }
function generateAndDisplayNegativeSplitPlan(distanceKm, paceFirstHalf, paceSecondHalf) { /* ... kode ... */ }
function generateAndDisplayAverageSplits(distanceKm, avgActualPaceSecondsPerKm, avgAdjustedPaceSecondsPerKm) { /* ... kode ... */ }
function generateAndDisplayPredictions(currentDistanceKm, equivalentFlatTotalSeconds) { /* ... kode ... */ }
function formatTimeMMSS(totalSeconds, includeMillis = true) { /* ... kode ... */ return "N/A"; }
function formatTimeLong(totalSeconds) { /* ... kode ... */ return "N/A"; }


// --- Initialisering ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM lastet.");
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        console.log("EVENT LISTENER KOBLET TIL SKJEMA (calculator-form).");
    } else {
        console.error("FEIL VED INITIALISERING: Skjemaet (calculator-form) ble ikke funnet i DOM!");
        showTestMessage("KRITISK FEIL: Finner ikke skjemaet!", true);
    }

    // Initialiser distanse-dropdown
    const distanceSelect = document.getElementById('distance-select');
    if (distanceSelect) {
         distanceSelect.addEventListener('change', handleDistanceChange);
         // Kjør den én gang for å sette riktig start-tilstand
         if (typeof distanceSelect.dispatchEvent === 'function') {
            try { // Legg til try-catch rundt dispatchEvent
                distanceSelect.dispatchEvent(new Event('change'));
                console.log("Initial 'change' event dispatched for distanceSelect.");
            } catch(e) {
                console.error("Feil ved dispatching av initial 'change' event:", e);
            }
         }
    } else {
        console.error("FEIL: distanceSelect ikke funnet ved initialisering.");
    }
    console.log("Kalkulator initialisert (med valideringstest).");
});
