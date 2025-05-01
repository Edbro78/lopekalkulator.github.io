// --- DOM Elementer ---
// Henter referanser til HTML-elementer som trengs for scriptet
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
// ... (resten av element-referansene kan stå, selv om de ikke brukes i denne testen)
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

// --- Event Listeners ---
// Legger til lyttere for hendelser på skjemaet og input-feltene
if (form) {
    form.addEventListener('submit', handleFormSubmit); // Kjører når skjemaet sendes inn
    console.log("Submit event listener lagt til form");
} else {
    console.error("FEIL: Skjema-elementet (form) ble ikke funnet!");
}
if (distanceSelect) {
    distanceSelect.addEventListener('change', handleDistanceChange); // Kjører når distansevalget endres
}
if (negativeSplitToggle) {
    negativeSplitToggle.addEventListener('change', () => { // Kjører når negativ splitt-toggle endres
        console.log("Negative split toggle endret");
        clearError(); // Fjerner eventuelle feilmeldinger
        hideResults(); // Skjuler resultatene
    });
}

// --- Funksjoner ---

/**
 * Håndterer innsending av skjemaet.
 * FORENKLET FOR FEILSØKING.
 * @param {Event} event - Skjemaets submit-event.
 */
function handleFormSubmit(event) {
    console.log("--- handleFormSubmit (FORENKLET) startet ---"); // Debugging
    if (!event || typeof event.preventDefault !== 'function') {
        console.error("handleFormSubmit ble kalt uten et gyldig event-objekt!");
        return;
    }
    event.preventDefault(); // Forhindrer standard skjemainnsending
    console.log("preventDefault kalt (FORENKLET)"); // Debugging
    clearError();
    hideResults(); // Skjul gamle resultater for å se om noe skjer

    // MIDLERTIDIG: Kommenterer ut all kjernefunksjonalitet
    /*
    try {
        console.log("Inne i try-blokk"); // Debugging
        const distanceKm = getSelectedDistance();
        const elevationM = getElevation();
        const timeInputs = getTimeInputs();
        const useNegativeSplit = negativeSplitToggle ? negativeSplitToggle.checked : false;

        console.log("Input hentet:", { distanceKm, elevationM, timeInputs, useNegativeSplit }); // Debugging

        console.log("Starter validering...");
        if (!validateInputs(distanceKm, elevationM, timeInputs)) {
            console.log("Validering feilet"); // Debugging
            return;
        }
        console.log("Validering OK"); // Debugging

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
            showError("Kunne ikke beregne nøkkelresultater. Sjekk inputverdiene.");
            console.log("Feil: Ugyldige nøkkelberegningsresultater (NaN/Infinity)"); // Debugging
            return;
        }
        console.log("Nøkkelberegninger er gyldige (Finite)"); // Debugging

        console.log("Starter displayResults..."); // Debugging
        displayResults(calculations, distanceKm, totalSeconds, elevationM > 0, useNegativeSplit, timeInputs);
        console.log("displayResults fullført."); // Debugging

    } catch (error) {
        console.error("En uventet feil oppstod i handleFormSubmit:", error); // Logg feilen til konsollen for debugging
        showError(`En uventet feil oppstod: ${error.message}`); // Vis mer spesifikk feilmelding til brukeren hvis mulig
    }
    */

    // Vis en enkel melding for å bekrefte at funksjonen kjørte uten å nullstille
    if (errorMessageDiv) {
        errorMessageDiv.textContent = "Test: handleFormSubmit kjørte uten å nullstille.";
        errorMessageDiv.style.color = 'green'; // Gjør det tydelig at det er en testmelding
    } else {
        console.log("Test: handleFormSubmit kjørte uten å nullstille (errorMessageDiv ikke funnet).");
    }

    console.log("--- handleFormSubmit (FORENKLET) ferdig ---");
}

// --- Resten av funksjonene (handleDistanceChange, getSelectedDistance, etc.) kan stå som de er ---
// --- De blir ikke kalt fra den forenklede handleFormSubmit uansett ---

/**
 * Håndterer endring i distanse-nedtrekksmenyen.
 * Viser/skjuler feltet for egendefinert distanse.
 */
function handleDistanceChange() {
    // Sjekk om elementene finnes før bruk
    if (distanceSelect && customDistanceContainer && customDistanceInput) {
        if (distanceSelect.value === 'custom') { // Hvis "Annen distanse" er valgt
            customDistanceContainer.classList.remove('hidden'); // Vis feltet
            customDistanceInput.required = true; // Gjør feltet påkrevd
            setTimeout(() => customDistanceInput.focus(), 0); // Sett fokus på feltet
        } else { // Hvis en forhåndsinnstilt distanse er valgt
            customDistanceContainer.classList.add('hidden'); // Skjul feltet
            customDistanceInput.required = false; // Gjør feltet ikke-påkrevd
            customDistanceInput.value = ''; // Tøm feltet
        }
        clearError(); // Fjern eventuelle feilmeldinger
        hideResults(); // Skjul resultatene
    } else {
        console.error("FEIL: Mangler elementer for distanseendring (distanceSelect, customDistanceContainer, eller customDistanceInput).");
    }
}

/**
 * Henter den valgte eller egendefinerte distansen i kilometer.
 * @returns {number} Distansen i kilometer, eller NaN hvis ugyldig.
 */
function getSelectedDistance() {
    if (!distanceSelect) return NaN; // Sjekk om elementet finnes
    const selection = distanceSelect.value;
    if (selection === 'custom') {
        if (!customDistanceInput) return NaN; // Sjekk om elementet finnes
        const customValue = customDistanceInput.value.trim().replace(',', '.'); // Erstatt komma med punktum
        return parseFloat(customValue); // Hent fra egendefinert felt
    }
    if (selection === 'preset') return NaN; // Ingen distanse valgt
    return parseFloat(selection); // Hent fra forhåndsinnstilt verdi
}

/**
 * Henter antall høydemeter fra input-feltet.
 * @returns {number} Antall høydemeter (standard 0), eller NaN hvis input ikke finnes.
 */
function getElevation() {
    if (!elevationInput) return NaN; // Sjekk om elementet finnes
    const elevationStr = elevationInput.value.trim().replace(',', '.') || '0'; // Erstatt komma, bruk '0' hvis tomt
    return parseFloat(elevationStr);
}

/**
 * Henter verdiene fra tid-inputfeltene (timer, minutter, sekunder).
 * @returns {object|null} Et objekt med tid-verdiene som strenger, eller null hvis input ikke finnes.
 */
function getTimeInputs() {
    // Sjekk om alle nødvendige input-elementer finnes
    if (!hoursInput || !minutesInput || !secondsInput) {
        console.error("FEIL: Mangler ett eller flere tid-input elementer (hours, minutes, seconds).");
        return null; // Returner null for å indikere feil
    }
    // Erstatt komma med punktum for sekunder for å håndtere desimaltegn
    const secondsStr = secondsInput.value.trim().replace(',', '.') || '0';
    return {
        hours: hoursInput.value.trim() || '0', // Hent timer, bruk '0' hvis tomt
        minutes: minutesInput.value.trim() || '0', // Hent minutter, bruk '0' hvis tomt
        seconds: secondsStr // Hent sekunder (med punktum), bruk '0' hvis tomt
    };
}

/**
 * Validerer inputverdiene for distanse, høydemeter og tid.
 * @param {number} distanceKm - Distansen i km.
 * @param {number} elevationM - Høydemeter.
 * @param {object|null} timeInputs - Objekt med tid-verdier, eller null.
 * @returns {boolean} True hvis input er gyldig, ellers false.
 */
function validateInputs(distanceKm, elevationM, timeInputs) {
     console.log("Validerer:", { distanceKm, elevationM, timeInputs });
     if (distanceSelect && distanceSelect.value === 'preset') {
         showError("Vennligst velg en distanse.");
         return false;
     }
     // Bruk Number.isFinite for å sjekke om det faktisk er et tall (ikke NaN eller Infinity)
     if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
         showError("Ugyldig eller manglende distanse. Bruk punktum for desimaler.");
         return false;
     }
     if (!Number.isFinite(elevationM) || elevationM < 0) {
         showError("Ugyldig verdi for høydemeter (må være 0 eller positiv).");
         return false;
     }

     // Sjekk om timeInputs er gyldig
     if (!timeInputs) {
         showError("Klarte ikke hente tidsverdier.");
         return false;
     }

     const hours = parseFloat(timeInputs.hours);
     const minutes = parseFloat(timeInputs.minutes);
     const seconds = parseFloat(timeInputs.seconds); // Sekunder kan ha desimaler
     console.log("Parsede tider:", { hours, minutes, seconds });

     // Sjekk om alle tidsdelene er gyldige tall
     if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
         showError("Tidsfeltene må inneholde gyldige tall. Bruk punktum for desimaler i sekunder.");
         return false;
     }
     // Sjekk for negative verdier
     if (hours < 0 || minutes < 0 || seconds < 0) {
         showError("Tidsverdier kan ikke være negative.");
         return false;
     }
     // Sjekk at minutter og sekunder er innenfor gyldige grenser
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

/**
 * Beregner total tid i sekunder fra timer, minutter og sekunder.
 * @param {object|null} timeInputs - Objekt med tid-verdier, eller null.
 * @returns {number} Total tid i sekunder, eller NaN hvis input er ugyldig.
 */
function calculateTotalSeconds(timeInputs) {
    if (!timeInputs) return NaN; // Returner NaN hvis input mangler

    const hours = parseFloat(timeInputs.hours);
    const minutes = parseFloat(timeInputs.minutes);
    const seconds = parseFloat(timeInputs.seconds); // Sekunder kan ha desimaler

    // Sjekk om alle delene er gyldige tall før beregning
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
        return NaN;
    }

    const total = (hours * 3600) + (minutes * 60) + seconds;
    return Number.isFinite(total) ? total : NaN; // Returner NaN hvis beregningen gir Infinity
}

/**
 * Utfører alle nødvendige løpsberegninger.
 * @param {number} distanceKm - Distanse i km.
 * @param {number} elevationM - Høydemeter.
 * @param {number} totalSeconds - Total tid i sekunder.
 * @returns {object} Et objekt som inneholder alle beregnede verdier (eller NaN for ugyldige).
 */
function performCalculations(distanceKm, elevationM, totalSeconds) {
    console.log("performCalculations input:", { distanceKm, elevationM, totalSeconds });
    // Initialiser resultatobjekt med NaN
    const results = {
        avgActualPaceSecondsPerKm: NaN, avgAdjustedPaceSecondsPerKm: NaN, speedKph: NaN,
        avgLapTimeSeconds: NaN, equivalentFlatTotalSeconds: NaN,
        paceFirstHalfSecsPerKm: NaN, paceSecondHalfSecsPerKm: NaN,
        exact800mSeconds: NaN, exact200mSeconds: NaN,
        estimatedHalfMarathonSeconds: NaN, estimatedHalfMarathonPaceSecsPerKm: NaN,
        recommendedIntervalPaceSecondsPerKm: NaN
    };

    // Dobbeltsjekk at input er gyldig før beregning
     if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
         console.warn("Ugyldig input til performCalculations:", {distanceKm, totalSeconds});
         return results; // Returner objekt med NaN-verdier
     }

    try {
        const totalHours = totalSeconds / 3600; // Total tid i timer
        results.avgActualPaceSecondsPerKm = totalSeconds / distanceKm; // Gjennomsnittlig faktisk pace (sek/km)
        results.speedKph = distanceKm / totalHours; // Gjennomsnittlig hastighet (km/t)

        // Beregn ekvivalent flat distanse ved å legge til "ekstra" distanse for høydemeter
        const equivalentFlatDistanceKm = Math.max(0.001, distanceKm + (elevationM / 1000) * ELEVATION_ADJUSTMENT_FACTOR);
        results.avgAdjustedPaceSecondsPerKm = totalSeconds / equivalentFlatDistanceKm; // Gjennomsnittlig justert pace (GAP) (sek/km)

        results.avgLapTimeSeconds = (results.avgActualPaceSecondsPerKm / 1000) * 400; // Gjennomsnittlig 400m rundetid (basert på faktisk pace)
        results.equivalentFlatTotalSeconds = results.avgAdjustedPaceSecondsPerKm * distanceKm; // Total tid det *ville* tatt på flat mark med samme innsats

        // Beregn pace for første og andre halvdel ved negativ splitt
        results.paceFirstHalfSecsPerKm = results.avgActualPaceSecondsPerKm * (1 + NEGATIVE_SPLIT_FACTOR);
        results.paceSecondHalfSecsPerKm = results.avgActualPaceSecondsPerKm * (1 - NEGATIVE_SPLIT_FACTOR);

        // Beregn eksakt tid for 800m og 200m basert på justert pace (GAP)
        results.exact800mSeconds = results.avgAdjustedPaceSecondsPerKm * 0.8;
        results.exact200mSeconds = results.avgAdjustedPaceSecondsPerKm * 0.2;

        // Sjekk at basis for Riegel (justert tid og distanse) er gyldig
        if (Number.isFinite(results.equivalentFlatTotalSeconds) && results.equivalentFlatTotalSeconds > 0 && distanceKm > 0) {
            // Estimer halvmaratontid ved hjelp av Riegels formel basert på justert tid/innsats
            results.estimatedHalfMarathonSeconds = results.equivalentFlatTotalSeconds * Math.pow(HALF_MARATHON_KM / distanceKm, RIEGEL_EXPONENT);
            // Sjekk om HM-tid er gyldig før beregning av pace
            if (Number.isFinite(results.estimatedHalfMarathonSeconds) && results.estimatedHalfMarathonSeconds > 0) {
                results.estimatedHalfMarathonPaceSecsPerKm = results.estimatedHalfMarathonSeconds / HALF_MARATHON_KM; // Estimer pace for halvmaraton
            }
        }

        // Beregn anbefalt intervallpace (1000m) basert på estimert halvmaratonpace
        if (Number.isFinite(results.estimatedHalfMarathonPaceSecsPerKm) && results.estimatedHalfMarathonPaceSecsPerKm > 0) {
             results.recommendedIntervalPaceSecondsPerKm = results.estimatedHalfMarathonPaceSecsPerKm - INTERVAL_PACE_ADJUSTMENT; // 5 sek raskere enn HM-pace
        }

        // Sjekk alle beregnede verdier for gyldighet (erstatt NaN/Infinity med NaN for konsistens)
        for (const key in results) {
            if (!Number.isFinite(results[key])) {
                results[key] = NaN;
            }
        }
        console.log("performCalculations output:", results);

    } catch (calcError) {
        console.error("Feil under beregning i performCalculations:", calcError);
        // Returnerer objektet med NaN-verdier hvis en feil oppstår
        return results;
    }

    return results; // Returner objektet med beregnede verdier (eller NaN)
}


/**
 * Viser de beregnede resultatene i HTML-elementene.
 * @param {object} calculations - Objekt med beregnede verdier.
 * @param {number} distanceKm - Opprinnelig distanse.
 * @param {number} totalSeconds - Opprinnelig total tid.
 * @param {boolean} hasElevation - Om høydemeter ble oppgitt.
 * @param {boolean} useNegativeSplit - Om negativ splitt er valgt.
 * @param {object} originalTimeInputs - Opprinnelige tid-input verdier.
 */
function displayResults(calculations, distanceKm, totalSeconds, hasElevation, useNegativeSplit, originalTimeInputs) {
    console.log("displayResults starter med calculations:", calculations);
    // --- Formater og Vis Hovedresultater ---
    // Bruk Number.isFinite for å sikre at vi ikke prøver å formatere NaN/Infinity
    const formattedAvgActualPace = Number.isFinite(calculations.avgActualPaceSecondsPerKm) ? formatTimeMMSS(calculations.avgActualPaceSecondsPerKm, true) : "N/A";
    const formattedAvgAdjustedPace = Number.isFinite(calculations.avgAdjustedPaceSecondsPerKm) ? formatTimeMMSS(calculations.avgAdjustedPaceSecondsPerKm, true) : "N/A";
    const formattedAvgLapTime = Number.isFinite(calculations.avgLapTimeSeconds) ? formatTimeMMSS(calculations.avgLapTimeSeconds, false) : "N/A";
    const formattedSpeed = Number.isFinite(calculations.speedKph) ? calculations.speedKph.toFixed(2) : "N/A";
    const formattedExact800mTime = Number.isFinite(calculations.exact800mSeconds) ? formatTimeLong(calculations.exact800mSeconds) : "N/A";
    const formattedExact200mTime = Number.isFinite(calculations.exact200mSeconds) ? formatTimeLong(calculations.exact200mSeconds) : "N/A";

    // Sjekk om elementene finnes før oppdatering
    if (paceResultSpan) paceResultSpan.textContent = `${formattedAvgActualPace} /km`;
    if (adjustedPaceResultSpan) adjustedPaceResultSpan.textContent = `${formattedAvgAdjustedPace} /km`;
    if (adjustedPaceNoteSpan) adjustedPaceNoteSpan.textContent = hasElevation ? '(justert for stigning)' : ''; // Vis note hvis høydemeter > 0
    if (lapTimeResultSpan) lapTimeResultSpan.textContent = formattedAvgLapTime;
    if (speedResultSpan) speedResultSpan.textContent = `${formattedSpeed} km/t`;
    if (time800mResultSpan) time800mResultSpan.textContent = formattedExact800mTime;
    if (time200mResultSpan) time200mResultSpan.textContent = formattedExact200mTime;

    // Vis info om negativ splitt pace hvis valgt og gyldig
    if (negativeSplitPacesInfoDiv && paceFirstHalfSpan && paceSecondHalfSpan) {
        if (useNegativeSplit && distanceKm > 0 && Number.isFinite(calculations.paceFirstHalfSecsPerKm) && Number.isFinite(calculations.paceSecondHalfSecsPerKm)) {
            paceFirstHalfSpan.textContent = formatTimeMMSS(calculations.paceFirstHalfSecsPerKm, true);
            paceSecondHalfSpan.textContent = formatTimeMMSS(calculations.paceSecondHalfSecsPerKm, true);
            negativeSplitPacesInfoDiv.classList.remove('hidden');
        } else {
            negativeSplitPacesInfoDiv.classList.add('hidden');
        }
    }

    // --- Vis Splittider / Løpsplan ---
    console.log("Genererer splittider/løpsplan...");
    if (useNegativeSplit && Number.isFinite(calculations.paceFirstHalfSecsPerKm) && Number.isFinite(calculations.paceSecondHalfSecsPerKm)) {
        generateAndDisplayNegativeSplitPlan(distanceKm, calculations.paceFirstHalfSecsPerKm, calculations.paceSecondHalfSecsPerKm);
    } else {
        generateAndDisplayAverageSplits(distanceKm, calculations.avgActualPaceSecondsPerKm, calculations.avgAdjustedPaceSecondsPerKm);
    }

    // --- Vis Prediksjoner ---
    console.log("Genererer prediksjoner...");
    generateAndDisplayPredictions(distanceKm, calculations.equivalentFlatTotalSeconds);

    // --- Vis Intervalltips ---
    console.log("Genererer intervalltips...");
    const originalTotalSeconds = calculateTotalSeconds(originalTimeInputs);
    const formattedOriginalTime = Number.isFinite(originalTotalSeconds) ? formatTimeLong(originalTotalSeconds) : "N/A";
    const formattedEstimatedHmTime = Number.isFinite(calculations.estimatedHalfMarathonSeconds) ? formatTimeLong(calculations.estimatedHalfMarathonSeconds) : "N/A";
    const formattedEstimatedHmPace = Number.isFinite(calculations.estimatedHalfMarathonPaceSecsPerKm) ? formatTimeMMSS(calculations.estimatedHalfMarathonPaceSecsPerKm, false) : "N/A";
    const formattedRecommendedIntervalPace = Number.isFinite(calculations.recommendedIntervalPaceSecondsPerKm) ? formatTimeMMSS(calculations.recommendedIntervalPaceSecondsPerKm, false) : "N/A";

    // Sjekk om intervall-elementene finnes
    if (intervalBasisDistanceSpan) intervalBasisDistanceSpan.textContent = `${distanceKm.toFixed(2)} km`;
    if (intervalBasisTimeSpan) intervalBasisTimeSpan.textContent = formattedOriginalTime;
    if (estimatedHmTimeSpan) estimatedHmTimeSpan.textContent = formattedEstimatedHmTime;
    if (estimatedHmPaceSpan) estimatedHmPaceSpan.textContent = formattedEstimatedHmPace;
    if (recommendedIntervalPaceSpan) recommendedIntervalPaceSpan.textContent = formattedRecommendedIntervalPace;

    // Vis intervallseksjonen kun hvis anbefalt pace er gyldig og ikke "N/A"
    if (intervalSectionDiv) {
        if (formattedRecommendedIntervalPace !== "N/A") {
            intervalSectionDiv.classList.remove('hidden');
        } else {
            intervalSectionDiv.classList.add('hidden');
        }
    }

    // Vis hele resultatseksjonen
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
        console.log("Resultatseksjon vist.");
    } else {
        console.error("FEIL: Resultatseksjonen (results-section) ble ikke funnet!");
    }
}

/**
 * Genererer og viser en løpsplan basert på negativ splitt.
 * @param {number} distanceKm - Total distanse.
 * @param {number} paceFirstHalf - Pace (sek/km) for første halvdel.
 * @param {number} paceSecondHalf - Pace (sek/km) for andre halvdel.
 */
function generateAndDisplayNegativeSplitPlan(distanceKm, paceFirstHalf, paceSecondHalf) {
    // Sjekk om nødvendige elementer finnes
    if (!splitsListDiv || !splitsTitleText || !splitsCol2Title || !splitsCol3Title || !splitsNote || !splitsContainer) {
        console.error("FEIL: Mangler elementer for negativ splitt-visning.");
        return;
    }

    splitsListDiv.innerHTML = ''; // Tøm tidligere splittider
    splitsTitleText.textContent = "Løpsplan med Negativ Splitt"; // Oppdater tittel
    splitsCol2Title.textContent = "Planlagt Pace"; // Oppdater kolonneoverskrift
    splitsCol3Title.textContent = "Akkumulert Tid"; // Oppdater kolonneoverskrift
    splitsNote.classList.remove('hidden'); // Vis notat om negativ splitt

    // Sjekk for ugyldige input
    if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(paceFirstHalf) || !Number.isFinite(paceSecondHalf)) {
        splitsContainer.classList.add('hidden'); // Skjul splitt-container hvis ugyldig
        console.warn("Ugyldig input til generateAndDisplayNegativeSplitPlan");
        return;
    }
    splitsContainer.classList.remove('hidden'); // Vis splitt-container

    const halfwayKm = distanceKm / 2; // Finn midtpunktet av distansen
    let accumulatedSeconds = 0; // Holder styr på akkumulert tid

    // Gå gjennom hver kilometer (eller del av siste kilometer)
    for (let km = 1; km <= Math.ceil(distanceKm); km++) {
        const kmStart = km - 1; // Starten av dette kilometersegmentet
        const kmEnd = Math.min(km, distanceKm); // Slutten av dette segmentet (maks total distanse)
        const kmDistance = kmEnd - kmStart; // Lengden på dette segmentet
        if (kmDistance <= 0) continue; // Hopp over hvis segmentet har null lengde

        let currentPace = NaN; // Pace for dette segmentet
        if (kmEnd <= halfwayKm) { // Hvis hele segmentet er i første halvdel
            currentPace = paceFirstHalf;
        } else if (kmStart >= halfwayKm) { // Hvis hele segmentet er i andre halvdel
            currentPace = paceSecondHalf;
        } else { // Hvis segmentet krysser midtpunktet
            const distFirstHalf = halfwayKm - kmStart; // Distanse i første halvdel
            const distSecondHalf = kmEnd - halfwayKm; // Distanse i andre halvdel
            // Sjekk om distansene er gyldige før beregning
            if (Number.isFinite(distFirstHalf) && Number.isFinite(distSecondHalf)) {
                 const timeFirstPart = distFirstHalf * paceFirstHalf; // Tid i første del
                 const timeSecondPart = distSecondHalf * paceSecondHalf; // Tid i andre del
                 // Sjekk om tidene er gyldige
                 if (Number.isFinite(timeFirstPart) && Number.isFinite(timeSecondPart) && kmDistance > 0) {
                    currentPace = (timeFirstPart + timeSecondPart) / kmDistance; // Beregn gjennomsnittspace for segmentet
                 } else {
                    console.warn("Ugyldig tid beregnet i splitt-kryssing");
                 }
            } else {
                 console.warn("Ugyldig distanse beregnet i splitt-kryssing");
            }
        }

        // Sjekk om currentPace er gyldig før bruk
        if (!Number.isFinite(currentPace)) {
            console.warn(`Ugyldig currentPace for km ${km}`);
            continue; // Hopp til neste iterasjon hvis pace er ugyldig
        }

        const kmSeconds = kmDistance * currentPace; // Tid for dette segmentet
        accumulatedSeconds += kmSeconds; // Legg til i akkumulert tid

        // Formater tidene for visning (sjekk gyldighet først)
        const formattedPace = formatTimeMMSS(currentPace, true);
        const formattedAccumulatedTime = Number.isFinite(accumulatedSeconds) ? formatTimeLong(accumulatedSeconds) : "N/A";

        // Lag HTML-element for splittiden
        const splitElement = document.createElement('div');
        splitElement.className = 'grid grid-cols-3 gap-2 items-center text-sm p-2 bg-white rounded shadow-xs border border-gray-100';
        splitElement.innerHTML = `
            <span class="text-left">Km ${kmStart.toFixed(0)}-${kmEnd.toFixed(2)}</span>
            <strong class="text-center text-indigo-700">${formattedPace}/km</strong>
            <strong class="text-right text-purple-700">${formattedAccumulatedTime}</strong>
        `;
        splitsListDiv.appendChild(splitElement); // Legg til elementet i listen

        if (kmEnd >= distanceKm) break; // Avslutt løkken hvis vi har nådd slutten
    }
}

/**
 * Genererer og viser splittider basert på gjennomsnittlig faktisk og justert pace.
 * @param {number} distanceKm - Total distanse.
 * @param {number} avgActualPaceSecondsPerKm - Gjennomsnittlig faktisk pace (sek/km).
 * @param {number} avgAdjustedPaceSecondsPerKm - Gjennomsnittlig justert pace (GAP) (sek/km).
 */
function generateAndDisplayAverageSplits(distanceKm, avgActualPaceSecondsPerKm, avgAdjustedPaceSecondsPerKm) {
     // Sjekk om nødvendige elementer finnes
     if (!splitsListDiv || !splitsTitleText || !splitsCol2Title || !splitsCol3Title || !splitsNote || !splitsContainer) {
        console.error("FEIL: Mangler elementer for gjennomsnittlig splitt-visning.");
        return;
    }

    splitsListDiv.innerHTML = ''; // Tøm tidligere splittider
    splitsTitleText.textContent = "Estimerte Splittider (per km)"; // Tilbakestill tittel
    splitsCol2Title.textContent = "Faktisk Tid"; // Tilbakestill kolonneoverskrift
    splitsCol3Title.textContent = "Justert Tid (GAP)"; // Tilbakestill kolonneoverskrift
    splitsNote.classList.add('hidden'); // Skjul notat om negativ splitt

    // Sjekk for ugyldige input
    if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(avgActualPaceSecondsPerKm) || !Number.isFinite(avgAdjustedPaceSecondsPerKm)) {
        splitsContainer.classList.add('hidden'); // Skjul splitt-container hvis ugyldig
        console.warn("Ugyldig input til generateAndDisplayAverageSplits");
        return;
    }
    splitsContainer.classList.remove('hidden'); // Vis splitt-container
    const fullKms = Math.floor(distanceKm); // Antall hele kilometer

    // Generer splittider for hver hele kilometer
    for (let km = 1; km <= fullKms; km++) {
        const actualSplitTimeSeconds = km * avgActualPaceSecondsPerKm; // Akkumulert faktisk tid
        const adjustedSplitTimeSeconds = km * avgAdjustedPaceSecondsPerKm; // Akkumulert justert tid

        // Formater tidene (sjekk gyldighet)
        const formattedActualSplitTime = Number.isFinite(actualSplitTimeSeconds) ? formatTimeLong(actualSplitTimeSeconds) : "N/A";
        const formattedAdjustedSplitTime = Number.isFinite(adjustedSplitTimeSeconds) ? formatTimeLong(adjustedSplitTimeSeconds) : "N/A";

        // Lag HTML-element for splittiden
        const splitElement = document.createElement('div');
        splitElement.className = 'grid grid-cols-3 gap-2 items-center text-sm p-2 bg-white rounded shadow-xs border border-gray-100';
        splitElement.innerHTML = `
            <span class="text-left">Kilometer ${km}</span>
            <strong class="text-center text-indigo-700">${formattedActualSplitTime}</strong>
            <strong class="text-right text-purple-700">${formattedAdjustedSplitTime}</strong>
        `;
        splitsListDiv.appendChild(splitElement); // Legg til elementet i listen
    }

    // Legg til en linje for den nøyaktige målgangstiden hvis distansen er > 0
    if (distanceKm > 0) {
        const finalActualTimeSeconds = distanceKm * avgActualPaceSecondsPerKm; // Endelig faktisk tid
        const finalAdjustedTimeSeconds = distanceKm * avgAdjustedPaceSecondsPerKm; // Endelig justert tid

        // Formater tidene (sjekk gyldighet)
        const formattedFinalActualTime = Number.isFinite(finalActualTimeSeconds) ? formatTimeLong(finalActualTimeSeconds) : "N/A";
        const formattedFinalAdjustedTime = Number.isFinite(finalAdjustedTimeSeconds) ? formatTimeLong(finalAdjustedTimeSeconds) : "N/A";

        // Lag HTML-element for målgang
        const splitElement = document.createElement('div');
        splitElement.className = 'grid grid-cols-3 gap-2 items-center text-sm p-2 bg-white rounded shadow-xs border border-gray-100 font-medium'; // Litt fetere skrift
        splitElement.innerHTML = `
            <span class="text-left">Målgang (${distanceKm.toFixed(2)} km)</span>
            <strong class="text-center text-indigo-700">${formattedFinalActualTime}</strong>
            <strong class="text-right text-purple-700">${formattedFinalAdjustedTime}</strong>
        `;
        splitsListDiv.appendChild(splitElement); // Legg til elementet i listen
    } else {
         splitsContainer.classList.add('hidden'); // Skjul hvis distanse er 0
    }
}

/**
 * Genererer og viser predikerte tider for andre distanser basert på Riegels formel.
 * @param {number} currentDistanceKm - Distansen som ble løpt.
 * @param {number} equivalentFlatTotalSeconds - Total tid justert for høyde (GAP-basert tid).
 */
function generateAndDisplayPredictions(currentDistanceKm, equivalentFlatTotalSeconds) {
    if (!predictionsGridDiv) {
        console.error("FEIL: Elementet predictions-grid ble ikke funnet.");
        return;
    }
    predictionsGridDiv.innerHTML = ''; // Tøm tidligere prediksjoner

    // Filtrer bort 200m og 800m fra prediksjonslisten, da disse vises separat basert på GAP
    const filteredPredictionDistances = PREDICTION_DISTANCES.filter(dist =>
         Math.abs(dist.value - 0.2) > 0.001 && Math.abs(dist.value - 0.8) > 0.001
    );
    // Sorter distansene fra kortest til lengst
    const sortedPredictionDistances = filteredPredictionDistances.sort((a, b) => a.value - b.value);

    sortedPredictionDistances.forEach(targetDistance => {
        // Ikke vis prediksjon for den distansen som faktisk ble løpt
        if (Math.abs(targetDistance.value - currentDistanceKm) < 0.001) return;
        // Sjekk for ugyldige input for Riegel-beregning
        if (!Number.isFinite(equivalentFlatTotalSeconds) || equivalentFlatTotalSeconds <= 0 || !Number.isFinite(currentDistanceKm) || currentDistanceKm <= 0) {
            console.warn("Ugyldig input til Riegel-prediksjon:", {equivalentFlatTotalSeconds, currentDistanceKm});
            return;
        }

        // Beregn predikert tid med Riegels formel
        const predictedSeconds = equivalentFlatTotalSeconds * Math.pow(targetDistance.value / currentDistanceKm, RIEGEL_EXPONENT);

        // Hopp over hvis prediksjonen er ugyldig (f.eks. NaN eller 0/negativ)
        if (!Number.isFinite(predictedSeconds) || predictedSeconds <= 0) {
            console.warn(`Ugyldig prediksjon for ${targetDistance.name}: ${predictedSeconds}`);
            return;
        }

        const formattedPredictedTime = formatTimeLong(predictedSeconds); // Formater tiden

        // Lag HTML-element for prediksjonen
        const predictionElement = document.createElement('div');
        predictionElement.className = 'prediction-item bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center transition duration-200 hover:shadow-md';
        predictionElement.innerHTML = `
            <span class="text-sm text-gray-500 block font-medium">${targetDistance.name}</span>
            <strong class="text-md font-semibold text-indigo-600 block">${formattedPredictedTime}</strong>
        `;
        predictionsGridDiv.appendChild(predictionElement); // Legg til elementet i grid'en
    });
}


// --- Hjelpefunksjoner ---

/**
 * Formaterer totalt antall sekunder til "m:ss.s" format.
 * Mer robust håndtering av avrunding og grensetilfeller.
 * @param {number} totalSeconds - Antall sekunder.
 * @param {boolean} [includeMillis=true] - Om millisekunder (en desimal) skal inkluderes.
 * @returns {string} Formattert tidstreng, eller "N/A".
 */
function formatTimeMMSS(totalSeconds, includeMillis = true) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "N/A"; // Sjekk for gyldig, ikke-negativt tall
    if (totalSeconds === 0) return includeMillis ? "0:00.0" : "0:00";

    // Bruk Math.round på totalSeconds * 10 for å håndtere millisekund-avrunding korrekt
    const totalTenthsOfSeconds = Math.round(totalSeconds * 10);
    let minutes = Math.floor(totalTenthsOfSeconds / 600); // 600 tideler per minutt
    let remainingTenths = totalTenthsOfSeconds % 600;

    let secondsPart = Math.floor(remainingTenths / 10);
    let millisPart = remainingTenths % 10;

    // Bygg den formatterte strengen
    let formattedTime = `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
    if (includeMillis) {
        formattedTime += `.${millisPart}`;
    }

    return formattedTime;
}


/**
 * Formaterer totalt antall sekunder til "h:mm:ss", "m:ss" eller "0:ss" format.
 * @param {number} totalSeconds - Antall sekunder.
 * @returns {string} Formattert tidstreng, eller "N/A".
 */
function formatTimeLong(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "N/A"; // Sjekk for gyldig, ikke-negativt tall
    if (totalSeconds === 0) return "0:00";

    // Rund av totalSeconds til nærmeste sekund FØR vi deler opp
    const roundedTotalSeconds = Math.round(totalSeconds);

    let hours = Math.floor(roundedTotalSeconds / 3600);
    let minutes = Math.floor((roundedTotalSeconds % 3600) / 60);
    let seconds = roundedTotalSeconds % 60;

    // Formater minutter og sekunder med ledende null hvis nødvendig
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    // Bygg strengen basert på om timer eller minutter er større enn 0
    if (hours > 0) {
        return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
        // Vis "m:ss" selv om minutter er 0, f.eks. "0:45"
        return `${minutes}:${formattedSeconds}`;
    }
}


/** Viser en feilmelding til brukeren. */
function showError(message) {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message; // Sett tekstinnholdet i feilmeldings-div'en
        errorMessageDiv.style.color = 'red'; // Sørg for at fargen er rød
    } else {
        console.error("FEIL: errorMessageDiv ikke funnet! Melding:", message);
    }
    if (resultsSection) {
        resultsSection.classList.add('hidden'); // Skjul resultatseksjonen
    }
}

/** Fjerner feilmeldingen. */
function clearError() {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = ''; // Tøm tekstinnholdet
    }
}

/** Skjuler resultatseksjonen og tømmer alle resultatfelter. */
function hideResults() {
    if (resultsSection) resultsSection.classList.add('hidden');
    if (paceResultSpan) paceResultSpan.textContent = '';
    if (adjustedPaceResultSpan) adjustedPaceResultSpan.textContent = '';
    if (adjustedPaceNoteSpan) adjustedPaceNoteSpan.textContent = '';
    if (lapTimeResultSpan) lapTimeResultSpan.textContent = '';
    if (speedResultSpan) speedResultSpan.textContent = '';
    if (time800mResultSpan) time800mResultSpan.textContent = '';
    if (time200mResultSpan) time200mResultSpan.textContent = '';
    if (negativeSplitPacesInfoDiv) negativeSplitPacesInfoDiv.classList.add('hidden');
    if (splitsListDiv) splitsListDiv.innerHTML = '';
    if (predictionsGridDiv) predictionsGridDiv.innerHTML = '';
    if (splitsNote) splitsNote.classList.add('hidden');
    if (intervalBasisDistanceSpan) intervalBasisDistanceSpan.textContent = '';
    if (intervalBasisTimeSpan) intervalBasisTimeSpan.textContent = '';
    if (estimatedHmTimeSpan) estimatedHmTimeSpan.textContent = '';
    if (estimatedHmPaceSpan) estimatedHmPaceSpan.textContent = '';
    if (recommendedIntervalPaceSpan) recommendedIntervalPaceSpan.textContent = '';
    if (intervalSectionDiv) intervalSectionDiv.classList.add('hidden');
}

// --- Initialisering ---
// Sikrer at DOM er lastet før vi prøver å kjøre initialisering
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fullstendig lastet og parset");
    // Kall handleDistanceChange() ved lasting for å sikre at riktig felt vises/skjules basert på startverdi.
    handleDistanceChange();
    console.log("Kalkulator initialisert."); // Debugging
});
