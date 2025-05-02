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
// Andre element-referanser
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
const RIEGEL_EXPONENT = 1.06;
const ELEVATION_ADJUSTMENT_FACTOR = 10;
const NEGATIVE_SPLIT_FACTOR = 0.01;
const HALF_MARATHON_KM = 21.0975;
const INTERVAL_PACE_ADJUSTMENT = 10;
const PREDICTION_DISTANCES = [
    { name: '400 m', value: 0.4 }, { name: '1500 m', value: 1.5 }, { name: '3 km', value: 3 },
    { name: '5 km', value: 5 }, { name: '10 km', value: 10 }, { name: '15 km', value: 15 },
    { name: 'Halvmaraton', value: HALF_MARATHON_KM }, { name: 'Maraton', value: 42.195 }, { name: '12 km', value: 12.000 }
];

// --- Hjelpefunksjoner ---
/** Viser en feilmelding/testmelding til brukeren. */
function showTestMessage(message, isError = false) {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.color = isError ? 'red' : 'green';
    } else {
        console.error("FEIL: errorMessageDiv ikke funnet! Melding:", message);
    }
    // Ikke skjul resultater her, det gjøres i starten av handleFormSubmit
    // if (resultsSection) {
    //     resultsSection.classList.add('hidden');
    // }
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

/** Skjuler resultatseksjonen og tømmer innhold (brukes før visning) */
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

// --- Event Listener ---

/**
 * Håndterer innsending av skjemaet.
 * Full funksjonalitet aktivert.
 * @param {Event} event - Skjemaets submit-event.
 */
function handleFormSubmit(event) {
    console.log("--- handleFormSubmit (Fullt aktivert) startet ---"); // Debugging
    if (!event || typeof event.preventDefault !== 'function') {
        console.error("handleFormSubmit ble kalt uten et gyldig event-objekt!");
        return;
    }
    event.preventDefault(); // Forhindrer standard skjemainnsending
    console.log("preventDefault kalt"); // Debugging
    clearError();
    hideResults(); // Skjul og tøm gamle resultater før ny visning

    try {
        console.log("Henter input..."); // Debugging
        const distanceKm = getSelectedDistance();
        const elevationM = getElevation();
        const timeInputs = getTimeInputs();
        const useNegativeSplit = negativeSplitToggle ? negativeSplitToggle.checked : false;

        console.log("Input hentet:", { distanceKm, elevationM, timeInputs, useNegativeSplit }); // Debugging

        console.log("Starter validering...");
        if (!validateInputs(distanceKm, elevationM, timeInputs)) {
            console.log("Validering feilet."); // Debugging
            return; // Stopp hvis validering feiler
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

        // Sjekk for NaN/Infinity i nøkkelresultater
        if (!Number.isFinite(calculations.avgActualPaceSecondsPerKm) ||
            !Number.isFinite(calculations.avgAdjustedPaceSecondsPerKm) ||
            !Number.isFinite(calculations.speedKph)) {
            showError("Kunne ikke beregne nøkkelresultater (pace/fart). Sjekk inputverdiene.");
            console.log("Feil: Ugyldige nøkkelberegningsresultater (NaN/Infinity)"); // Debugging
            return;
        }
        console.log("Nøkkelberegninger er gyldige (Finite)"); // Debugging

        // RE-AKTIVERT: Visning av resultater
        console.log("Starter displayResults..."); // Debugging
        displayResults(calculations, distanceKm, totalSeconds, elevationM > 0, useNegativeSplit, timeInputs);
        console.log("displayResults fullført."); // Debugging

    } catch (error) {
        console.error("En uventet feil oppstod i handleFormSubmit:", error); // Logg feilen
        showError(`En uventet feil oppstod: ${error.message}`, true); // Vis feilmelding
    }

    console.log("--- handleFormSubmit (Fullt aktivert) ferdig ---");
}

// --- Funksjoner for input-henting og validering ---

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


// --- Kalkuleringsfunksjoner ---

/**
 * Beregner total tid i sekunder fra timer, minutter og sekunder.
 */
function calculateTotalSeconds(timeInputs) {
    if (!timeInputs) return NaN;
    const hours = parseFloat(timeInputs.hours);
    const minutes = parseFloat(timeInputs.minutes);
    const seconds = parseFloat(timeInputs.seconds);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
        console.warn("Ugyldige tidskomponenter i calculateTotalSeconds:", {hours, minutes, seconds});
        return NaN;
    }
    const total = (hours * 3600) + (minutes * 60) + seconds;
    return Number.isFinite(total) ? total : NaN;
}


/**
 * Utfører alle nødvendige løpsberegninger.
 */
function performCalculations(distanceKm, elevationM, totalSeconds) {
    console.log("performCalculations input:", { distanceKm, elevationM, totalSeconds });
    const results = {
        avgActualPaceSecondsPerKm: NaN, avgAdjustedPaceSecondsPerKm: NaN, speedKph: NaN,
        avgLapTimeSeconds: NaN, equivalentFlatTotalSeconds: NaN,
        paceFirstHalfSecsPerKm: NaN, paceSecondHalfSecsPerKm: NaN,
        exact800mSeconds: NaN, exact200mSeconds: NaN,
        estimatedHalfMarathonSeconds: NaN, estimatedHalfMarathonPaceSecsPerKm: NaN,
        recommendedIntervalPaceSecondsPerKm: NaN
    };
     if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
         console.warn("Ugyldig input til performCalculations:", {distanceKm, totalSeconds});
         return results;
     }
    try {
        const totalHours = totalSeconds / 3600;
        results.avgActualPaceSecondsPerKm = totalSeconds / distanceKm;
        results.speedKph = distanceKm / totalHours;
        const equivalentFlatDistanceKm = Math.max(0.001, distanceKm + (elevationM / 1000) * ELEVATION_ADJUSTMENT_FACTOR);
        results.avgAdjustedPaceSecondsPerKm = totalSeconds / equivalentFlatDistanceKm;
        results.avgLapTimeSeconds = (results.avgActualPaceSecondsPerKm / 1000) * 400;
        results.equivalentFlatTotalSeconds = results.avgAdjustedPaceSecondsPerKm * distanceKm;
        results.paceFirstHalfSecsPerKm = results.avgActualPaceSecondsPerKm * (1 + NEGATIVE_SPLIT_FACTOR);
        results.paceSecondHalfSecsPerKm = results.avgActualPaceSecondsPerKm * (1 - NEGATIVE_SPLIT_FACTOR);
        results.exact800mSeconds = results.avgAdjustedPaceSecondsPerKm * 0.8;
        results.exact200mSeconds = results.avgAdjustedPaceSecondsPerKm * 0.2;
        if (Number.isFinite(results.equivalentFlatTotalSeconds) && results.equivalentFlatTotalSeconds > 0 && distanceKm > 0) {
            results.estimatedHalfMarathonSeconds = results.equivalentFlatTotalSeconds * Math.pow(HALF_MARATHON_KM / distanceKm, RIEGEL_EXPONENT);
            if (Number.isFinite(results.estimatedHalfMarathonSeconds) && results.estimatedHalfMarathonSeconds > 0) {
                results.estimatedHalfMarathonPaceSecsPerKm = results.estimatedHalfMarathonSeconds / HALF_MARATHON_KM;
            }
        }
        if (Number.isFinite(results.estimatedHalfMarathonPaceSecsPerKm) && results.estimatedHalfMarathonPaceSecsPerKm > 0) {
             results.recommendedIntervalPaceSecondsPerKm = results.estimatedHalfMarathonPaceSecsPerKm - INTERVAL_PACE_ADJUSTMENT;
        }
        for (const key in results) {
            if (!Number.isFinite(results[key])) {
                results[key] = NaN;
            }
        }
        console.log("performCalculations output:", results);
    } catch (calcError) {
        console.error("Feil under beregning i performCalculations:", calcError);
        return results; // Returner objekt med potensielle NaN-verdier
    }
    return results;
}


// --- RE-AKTIVERT: Visningsfunksjoner ---

/**
 * Viser de beregnede resultatene i HTML-elementene.
 */
function displayResults(calculations, distanceKm, totalSeconds, hasElevation, useNegativeSplit, originalTimeInputs) {
    console.log("displayResults starter med calculations:", calculations);
    // Formater Hovedresultater
    const formattedAvgActualPace = Number.isFinite(calculations.avgActualPaceSecondsPerKm) ? formatTimeMMSS(calculations.avgActualPaceSecondsPerKm, true) : "N/A";
    const formattedAvgAdjustedPace = Number.isFinite(calculations.avgAdjustedPaceSecondsPerKm) ? formatTimeMMSS(calculations.avgAdjustedPaceSecondsPerKm, true) : "N/A";
    const formattedAvgLapTime = Number.isFinite(calculations.avgLapTimeSeconds) ? formatTimeMMSS(calculations.avgLapTimeSeconds, false) : "N/A";
    const formattedSpeed = Number.isFinite(calculations.speedKph) ? calculations.speedKph.toFixed(2) : "N/A";
    const formattedExact800mTime = Number.isFinite(calculations.exact800mSeconds) ? formatTimeLong(calculations.exact800mSeconds) : "N/A";
    const formattedExact200mTime = Number.isFinite(calculations.exact200mSeconds) ? formatTimeLong(calculations.exact200mSeconds) : "N/A";

    // Oppdater Hovedresultater i DOM (med sjekk om element finnes)
    if (paceResultSpan) paceResultSpan.textContent = `${formattedAvgActualPace} /km`;
    if (adjustedPaceResultSpan) adjustedPaceResultSpan.textContent = `${formattedAvgAdjustedPace} /km`;
    if (adjustedPaceNoteSpan) adjustedPaceNoteSpan.textContent = hasElevation ? '(justert for stigning)' : '';
    if (lapTimeResultSpan) lapTimeResultSpan.textContent = formattedAvgLapTime;
    if (speedResultSpan) speedResultSpan.textContent = `${formattedSpeed} km/t`;
    if (time800mResultSpan) time800mResultSpan.textContent = formattedExact800mTime;
    if (time200mResultSpan) time200mResultSpan.textContent = formattedExact200mTime;

    // Vis info om negativ splitt pace
    if (negativeSplitPacesInfoDiv && paceFirstHalfSpan && paceSecondHalfSpan) {
        if (useNegativeSplit && distanceKm > 0 && Number.isFinite(calculations.paceFirstHalfSecsPerKm) && Number.isFinite(calculations.paceSecondHalfSecsPerKm)) {
            paceFirstHalfSpan.textContent = formatTimeMMSS(calculations.paceFirstHalfSecsPerKm, true);
            paceSecondHalfSpan.textContent = formatTimeMMSS(calculations.paceSecondHalfSecsPerKm, true);
            negativeSplitPacesInfoDiv.classList.remove('hidden');
        } else {
            negativeSplitPacesInfoDiv.classList.add('hidden');
        }
    }

    // Vis Splittider / Løpsplan
    console.log("Genererer splittider/løpsplan...");
    if (useNegativeSplit && Number.isFinite(calculations.paceFirstHalfSecsPerKm) && Number.isFinite(calculations.paceSecondHalfSecsPerKm)) {
        generateAndDisplayNegativeSplitPlan(distanceKm, calculations.paceFirstHalfSecsPerKm, calculations.paceSecondHalfSecsPerKm);
    } else {
        generateAndDisplayAverageSplits(distanceKm, calculations.avgActualPaceSecondsPerKm, calculations.avgAdjustedPaceSecondsPerKm);
    }

    // Vis Prediksjoner
    console.log("Genererer prediksjoner...");
    generateAndDisplayPredictions(distanceKm, calculations.equivalentFlatTotalSeconds);

    // Vis Intervalltips
    console.log("Genererer intervalltips...");
    const originalTotalSeconds = calculateTotalSeconds(originalTimeInputs); // Beregn på nytt for sikkerhets skyld
    const formattedOriginalTime = Number.isFinite(originalTotalSeconds) ? formatTimeLong(originalTotalSeconds) : "N/A";
    const formattedEstimatedHmTime = Number.isFinite(calculations.estimatedHalfMarathonSeconds) ? formatTimeLong(calculations.estimatedHalfMarathonSeconds) : "N/A";
    const formattedEstimatedHmPace = Number.isFinite(calculations.estimatedHalfMarathonPaceSecsPerKm) ? formatTimeMMSS(calculations.estimatedHalfMarathonPaceSecsPerKm, false) : "N/A";
    const formattedRecommendedIntervalPace = Number.isFinite(calculations.recommendedIntervalPaceSecondsPerKm) ? formatTimeMMSS(calculations.recommendedIntervalPaceSecondsPerKm, false) : "N/A";

    // Oppdater Intervalltips i DOM (med sjekk om element finnes)
    if (intervalBasisDistanceSpan) intervalBasisDistanceSpan.textContent = Number.isFinite(distanceKm) ? `${distanceKm.toFixed(2)} km` : "N/A";
    if (intervalBasisTimeSpan) intervalBasisTimeSpan.textContent = formattedOriginalTime;
    if (estimatedHmTimeSpan) estimatedHmTimeSpan.textContent = formattedEstimatedHmTime;
    if (estimatedHmPaceSpan) estimatedHmPaceSpan.textContent = formattedEstimatedHmPace;
    if (recommendedIntervalPaceSpan) recommendedIntervalPaceSpan.textContent = formattedRecommendedIntervalPace;

    // Vis intervallseksjonen kun hvis anbefalt pace er gyldig
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
 */
function generateAndDisplayNegativeSplitPlan(distanceKm, paceFirstHalf, paceSecondHalf) {
    if (!splitsListDiv || !splitsTitleText || !splitsCol2Title || !splitsCol3Title || !splitsNote || !splitsContainer) {
        console.error("FEIL: Mangler elementer for negativ splitt-visning.");
        return;
    }
    splitsListDiv.innerHTML = '';
    splitsTitleText.textContent = "Løpsplan med Negativ Splitt";
    splitsCol2Title.textContent = "Planlagt Pace";
    splitsCol3Title.textContent = "Akkumulert Tid";
    splitsNote.classList.remove('hidden');
    if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(paceFirstHalf) || !Number.isFinite(paceSecondHalf)) {
        splitsContainer.classList.add('hidden');
        console.warn("Ugyldig input til generateAndDisplayNegativeSplitPlan");
        return;
    }
    splitsContainer.classList.remove('hidden');
    const halfwayKm = distanceKm / 2;
    let accumulatedSeconds = 0;
    for (let km = 1; km <= Math.ceil(distanceKm); km++) {
        const kmStart = km - 1;
        const kmEnd = Math.min(km, distanceKm);
        const kmDistance = kmEnd - kmStart;
        if (kmDistance <= 0) continue;
        let currentPace = NaN;
        if (kmEnd <= halfwayKm) {
            currentPace = paceFirstHalf;
        } else if (kmStart >= halfwayKm) {
            currentPace = paceSecondHalf;
        } else {
            const distFirstHalf = halfwayKm - kmStart;
            const distSecondHalf = kmEnd - halfwayKm;
            if (Number.isFinite(distFirstHalf) && Number.isFinite(distSecondHalf)) {
                 const timeFirstPart = distFirstHalf * paceFirstHalf;
                 const timeSecondPart = distSecondHalf * paceSecondHalf;
                 if (Number.isFinite(timeFirstPart) && Number.isFinite(timeSecondPart) && kmDistance > 0) {
                    currentPace = (timeFirstPart + timeSecondPart) / kmDistance;
                 } else { console.warn("Ugyldig tid beregnet i splitt-kryssing"); }
            } else { console.warn("Ugyldig distanse beregnet i splitt-kryssing"); }
        }
        if (!Number.isFinite(currentPace)) {
            console.warn(`Ugyldig currentPace for km ${km}`);
            continue;
        }
        const kmSeconds = kmDistance * currentPace;
        accumulatedSeconds += kmSeconds;
        const formattedPace = formatTimeMMSS(currentPace, true);
        const formattedAccumulatedTime = Number.isFinite(accumulatedSeconds) ? formatTimeLong(accumulatedSeconds) : "N/A";
        const splitElement = document.createElement('div');
        splitElement.className = 'grid grid-cols-3 gap-2 items-center text-sm p-2 bg-white rounded shadow-xs border border-gray-100';
        splitElement.innerHTML = `
            <span class="text-left">Km ${kmStart.toFixed(0)}-${kmEnd.toFixed(2)}</span>
            <strong class="text-center text-indigo-700">${formattedPace}/km</strong>
            <strong class="text-right text-purple-700">${formattedAccumulatedTime}</strong>
        `;
        splitsListDiv.appendChild(splitElement);
        if (kmEnd >= distanceKm) break;
    }
}

/**
 * Genererer og viser splittider basert på gjennomsnittlig pace.
 */
function generateAndDisplayAverageSplits(distanceKm, avgActualPaceSecondsPerKm, avgAdjustedPaceSecondsPerKm) {
     if (!splitsListDiv || !splitsTitleText || !splitsCol2Title || !splitsCol3Title || !splitsNote || !splitsContainer) {
        console.error("FEIL: Mangler elementer for gjennomsnittlig splitt-visning.");
        return;
    }
    splitsListDiv.innerHTML = '';
    splitsTitleText.textContent = "Estimerte Splittider (per km)";
    splitsCol2Title.textContent = "Faktisk Tid";
    splitsCol3Title.textContent = "Justert Tid (GAP)";
    splitsNote.classList.add('hidden');
    if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(avgActualPaceSecondsPerKm) || !Number.isFinite(avgAdjustedPaceSecondsPerKm)) {
        splitsContainer.classList.add('hidden');
        console.warn("Ugyldig input til generateAndDisplayAverageSplits");
        return;
    }
    splitsContainer.classList.remove('hidden');
    const fullKms = Math.floor(distanceKm);
    for (let km = 1; km <= fullKms; km++) {
        const actualSplitTimeSeconds = km * avgActualPaceSecondsPerKm;
        const adjustedSplitTimeSeconds = km * avgAdjustedPaceSecondsPerKm;
        const formattedActualSplitTime = Number.isFinite(actualSplitTimeSeconds) ? formatTimeLong(actualSplitTimeSeconds) : "N/A";
        const formattedAdjustedSplitTime = Number.isFinite(adjustedSplitTimeSeconds) ? formatTimeLong(adjustedSplitTimeSeconds) : "N/A";
        const splitElement = document.createElement('div');
        splitElement.className = 'grid grid-cols-3 gap-2 items-center text-sm p-2 bg-white rounded shadow-xs border border-gray-100';
        splitElement.innerHTML = `
            <span class="text-left">Kilometer ${km}</span>
            <strong class="text-center text-indigo-700">${formattedActualSplitTime}</strong>
            <strong class="text-right text-purple-700">${formattedAdjustedSplitTime}</strong>
        `;
        splitsListDiv.appendChild(splitElement);
    }
    if (distanceKm > 0) {
        const finalActualTimeSeconds = distanceKm * avgActualPaceSecondsPerKm;
        const finalAdjustedTimeSeconds = distanceKm * avgAdjustedPaceSecondsPerKm;
        const formattedFinalActualTime = Number.isFinite(finalActualTimeSeconds) ? formatTimeLong(finalActualTimeSeconds) : "N/A";
        const formattedFinalAdjustedTime = Number.isFinite(finalAdjustedTimeSeconds) ? formatTimeLong(finalAdjustedTimeSeconds) : "N/A";
        const splitElement = document.createElement('div');
        splitElement.className = 'grid grid-cols-3 gap-2 items-center text-sm p-2 bg-white rounded shadow-xs border border-gray-100 font-medium';
        splitElement.innerHTML = `
            <span class="text-left">Målgang (${distanceKm.toFixed(2)} km)</span>
            <strong class="text-center text-indigo-700">${formattedFinalActualTime}</strong>
            <strong class="text-right text-purple-700">${formattedFinalAdjustedTime}</strong>
        `;
        splitsListDiv.appendChild(splitElement);
    } else {
         splitsContainer.classList.add('hidden');
    }
}

/**
 * Genererer og viser predikerte tider for andre distanser.
 */
function generateAndDisplayPredictions(currentDistanceKm, equivalentFlatTotalSeconds) {
    if (!predictionsGridDiv) {
        console.error("FEIL: Elementet predictions-grid ble ikke funnet.");
        return;
    }
    predictionsGridDiv.innerHTML = '';
    const filteredPredictionDistances = PREDICTION_DISTANCES.filter(dist =>
         Math.abs(dist.value - 0.2) > 0.001 && Math.abs(dist.value - 0.8) > 0.001
    );
    const sortedPredictionDistances = filteredPredictionDistances.sort((a, b) => a.value - b.value);
    sortedPredictionDistances.forEach(targetDistance => {
        if (Math.abs(targetDistance.value - currentDistanceKm) < 0.001) return;
        if (!Number.isFinite(equivalentFlatTotalSeconds) || equivalentFlatTotalSeconds <= 0 || !Number.isFinite(currentDistanceKm) || currentDistanceKm <= 0) {
            console.warn("Ugyldig input til Riegel-prediksjon:", {equivalentFlatTotalSeconds, currentDistanceKm});
            return;
        }
        const predictedSeconds = equivalentFlatTotalSeconds * Math.pow(targetDistance.value / currentDistanceKm, RIEGEL_EXPONENT);
        if (!Number.isFinite(predictedSeconds) || predictedSeconds <= 0) {
            console.warn(`Ugyldig prediksjon for ${targetDistance.name}: ${predictedSeconds}`);
            return;
        }
        const formattedPredictedTime = formatTimeLong(predictedSeconds);
        const predictionElement = document.createElement('div');
        predictionElement.className = 'prediction-item bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center transition duration-200 hover:shadow-md';
        predictionElement.innerHTML = `
            <span class="text-sm text-gray-500 block font-medium">${targetDistance.name}</span>
            <strong class="text-md font-semibold text-indigo-600 block">${formattedPredictedTime}</strong>
        `;
        predictionsGridDiv.appendChild(predictionElement);
    });
}


// --- Formateringsfunksjoner ---

/**
 * Formaterer tid til "m:ss.s" format.
 */
function formatTimeMMSS(totalSeconds, includeMillis = true) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "N/A";
    if (totalSeconds === 0) return includeMillis ? "0:00.0" : "0:00";
    const totalTenthsOfSeconds = Math.round(totalSeconds * 10);
    let minutes = Math.floor(totalTenthsOfSeconds / 600);
    let remainingTenths = totalTenthsOfSeconds % 600;
    let secondsPart = Math.floor(remainingTenths / 10);
    let millisPart = remainingTenths % 10;
    let formattedTime = `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
    if (includeMillis) {
        formattedTime += `.${millisPart}`;
    }
    return formattedTime;
}


/**
 * Formaterer tid til "h:mm:ss", "m:ss" eller "0:ss" format.
 */
function formatTimeLong(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "N/A";
    if (totalSeconds === 0) return "0:00";
    const roundedTotalSeconds = Math.round(totalSeconds);
    let hours = Math.floor(roundedTotalSeconds / 3600);
    let minutes = Math.floor((roundedTotalSeconds % 3600) / 60);
    let seconds = roundedTotalSeconds % 60;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    if (hours > 0) {
        return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
        return `${minutes}:${formattedSeconds}`;
    }
}


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
    const distanceSelect = document.getElementById('distance-select');
    if (distanceSelect) {
         distanceSelect.addEventListener('change', handleDistanceChange);
         if (typeof distanceSelect.dispatchEvent === 'function') {
            try {
                distanceSelect.dispatchEvent(new Event('change'));
                console.log("Initial 'change' event dispatched for distanceSelect.");
            } catch(e) {
                console.error("Feil ved dispatching av initial 'change' event:", e);
            }
         }
    } else {
        console.error("FEIL: distanceSelect ikke funnet ved initialisering.");
    }
    console.log("Kalkulator initialisert (Fullt aktivert).");
});
