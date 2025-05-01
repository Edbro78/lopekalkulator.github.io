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
// Definerer faste verdier som brukes i beregningene
const RIEGEL_EXPONENT = 1.06; // Eksponent for Riegels formel for å estimere tider
const ELEVATION_ADJUSTMENT_FACTOR = 10; // Faktor for å justere for høydemeter (10hm ≈ 100m flatt)
const NEGATIVE_SPLIT_FACTOR = 0.02; // Prosentfaktor for negativ splitt (2%)
const HALF_MARATHON_KM = 21.0975; // Distanse for halvmaraton i km
const INTERVAL_PACE_ADJUSTMENT = 5; // Antall sekunder raskere per km for intervalltrening vs. halvmaratonfart
const PREDICTION_DISTANCES = [ // Liste over distanser for prediksjoner
    { name: '400 m', value: 0.4 }, { name: '1500 m', value: 1.5 }, { name: '3 km', value: 3 },
    { name: '5 km', value: 5 }, { name: '10 km', value: 10 }, { name: '15 km', value: 15 },
    { name: 'Halvmaraton', value: HALF_MARATHON_KM }, { name: 'Maraton', value: 42.195 }
];

// --- Event Listeners ---
// Legger til lyttere for hendelser på skjemaet og input-feltene
form.addEventListener('submit', handleFormSubmit); // Kjører når skjemaet sendes inn
distanceSelect.addEventListener('change', handleDistanceChange); // Kjører når distansevalget endres
negativeSplitToggle.addEventListener('change', () => { // Kjører når negativ splitt-toggle endres
    clearError(); // Fjerner eventuelle feilmeldinger
    hideResults(); // Skjuler resultatene
});

// --- Funksjoner ---

/**
 * Håndterer innsending av skjemaet.
 * Henter input, validerer, utfører beregninger og viser resultater eller feilmelding.
 * @param {Event} event - Skjemaets submit-event.
 */
function handleFormSubmit(event) {
    console.log("handleFormSubmit startet"); // Debugging
    event.preventDefault(); // Forhindrer standard skjemainnsending (siderefresh)
    console.log("preventDefault kalt"); // Debugging
    clearError(); // Fjern gamle feil først
    hideResults(); // Skjul gamle resultater

    // Bruk try-catch for generell feilhåndtering under beregningene
    try {
        console.log("Inne i try-blokk"); // Debugging
        const distanceKm = getSelectedDistance(); // Henter valgt/oppgitt distanse
        const elevationM = getElevation(); // Henter oppgitte høydemeter
        const timeInputs = getTimeInputs(); // Henter tid-input (timer, minutter, sekunder)
        const useNegativeSplit = negativeSplitToggle.checked; // Sjekker om negativ splitt er valgt

        console.log("Input hentet:", { distanceKm, elevationM, timeInputs, useNegativeSplit }); // Debugging

        // Validering sjekkes først
        if (!validateInputs(distanceKm, elevationM, timeInputs)) {
            console.log("Validering feilet"); // Debugging
            return; // Stopp hvis validering feiler
        }
        console.log("Validering OK"); // Debugging

        const totalSeconds = calculateTotalSeconds(timeInputs); // Beregner total tid i sekunder
        console.log("TotalSeconds beregnet:", totalSeconds); // Debugging

        // Sjekk total tid etter validering
        if (totalSeconds <= 0) {
            showError("Total tid må være større enn null.");
            console.log("Feil: Total tid er 0 eller mindre"); // Debugging
            return;
        }

        // Utfører alle løpsberegningene
        console.log("Starter performCalculations..."); // Debugging
        const calculations = performCalculations(distanceKm, elevationM, totalSeconds);
        console.log("Calculations fullført:", calculations); // Debugging

        // Sjekk for NaN (Not a Number) eller Infinity i kritiske beregninger før visning
        if (!Number.isFinite(calculations.avgActualPaceSecondsPerKm) ||
            !Number.isFinite(calculations.avgAdjustedPaceSecondsPerKm) ||
            !Number.isFinite(calculations.speedKph)) {
            showError("Kunne ikke beregne resultater. Sjekk inputverdiene.");
            console.log("Feil: Ugyldige beregningsresultater (NaN/Infinity)"); // Debugging
            return;
        }
        console.log("Beregninger er gyldige (Finite)"); // Debugging

        // Viser de beregnede resultatene på siden
        console.log("Starter displayResults..."); // Debugging
        displayResults(calculations, distanceKm, totalSeconds, elevationM > 0, useNegativeSplit, timeInputs);
        console.log("displayResults fullført."); // Debugging

    } catch (error) {
        console.error("En uventet feil oppstod i handleFormSubmit:", error); // Logg feilen til konsollen for debugging
        showError("En uventet feil oppstod under beregningen."); // Vis generell feilmelding til brukeren
    }
}

/**
 * Håndterer endring i distanse-nedtrekksmenyen.
 * Viser/skjuler feltet for egendefinert distanse.
 */
function handleDistanceChange() {
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
}

/**
 * Henter den valgte eller egendefinerte distansen i kilometer.
 * @returns {number} Distansen i kilometer, eller NaN hvis ugyldig.
 */
function getSelectedDistance() {
    const selection = distanceSelect.value;
    if (selection === 'custom') {
        const customValue = customDistanceInput.value.replace(',', '.'); // Erstatt komma med punktum
        return parseFloat(customValue); // Hent fra egendefinert felt
    }
    if (selection === 'preset') return NaN; // Ingen distanse valgt
    return parseFloat(selection); // Hent fra forhåndsinnstilt verdi
}

/**
 * Henter antall høydemeter fra input-feltet.
 * @returns {number} Antall høydemeter (standard 0).
 */
function getElevation() {
    const elevationStr = elevationInput.value.trim().replace(',', '.') || '0'; // Erstatt komma, bruk '0' hvis tomt
    return parseFloat(elevationStr);
}

/**
 * Henter verdiene fra tid-inputfeltene (timer, minutter, sekunder).
 * @returns {object} Et objekt med tid-verdiene som strenger.
 */
function getTimeInputs() {
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
 * @param {object} timeInputs - Objekt med tid-verdier.
 * @returns {boolean} True hvis input er gyldig, ellers false.
 */
function validateInputs(distanceKm, elevationM, timeInputs) {
     if (distanceSelect.value === 'preset') { showError("Vennligst velg en distanse."); return false; }
     // Bruk Number.isFinite for å sjekke om det faktisk er et tall (ikke NaN eller Infinity)
     if (!Number.isFinite(distanceKm) || distanceKm <= 0) { showError("Ugyldig eller manglende distanse. Bruk punktum for desimaler."); return false; }
     if (!Number.isFinite(elevationM) || elevationM < 0) { showError("Ugyldig verdi for høydemeter."); return false; }

     const hours = parseFloat(timeInputs.hours);
     const minutes = parseFloat(timeInputs.minutes);
     const seconds = parseFloat(timeInputs.seconds); // Sekunder kan ha desimaler

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
     // Sjekk at minutter og sekunder (heltallsdelen) er under 60
     if (Math.floor(minutes) >= 60 || Math.floor(seconds) >= 60) {
         showError("Minutter og heltallsdelen av sekunder må være under 60.");
         return false;
     }
     return true; // Alt er gyldig
}

/**
 * Beregner total tid i sekunder fra timer, minutter og sekunder.
 * @param {object} timeInputs - Objekt med tid-verdier.
 * @returns {number} Total tid i sekunder.
 */
function calculateTotalSeconds(timeInputs) {
    const hours = parseFloat(timeInputs.hours);
    const minutes = parseFloat(timeInputs.minutes);
    const seconds = parseFloat(timeInputs.seconds); // Sekunder kan ha desimaler
    // Sikre at resultatet er et gyldig tall
    const total = (hours * 3600) + (minutes * 60) + seconds;
    return Number.isFinite(total) ? total : 0; // Returner 0 hvis beregningen gir NaN/Infinity
}

/**
 * Utfører alle nødvendige løpsberegninger.
 * @param {number} distanceKm - Distanse i km.
 * @param {number} elevationM - Høydemeter.
 * @param {number} totalSeconds - Total tid i sekunder.
 * @returns {object} Et objekt som inneholder alle beregnede verdier.
 */
function performCalculations(distanceKm, elevationM, totalSeconds) {
    // Dobbeltsjekk at input er gyldig før beregning
     if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
         // Returner et objekt med NaN for å indikere feil hvis input er ugyldig
         console.warn("Ugyldig input til performCalculations:", {distanceKm, totalSeconds});
         return {
             avgActualPaceSecondsPerKm: NaN, avgAdjustedPaceSecondsPerKm: NaN, speedKph: NaN,
             avgLapTimeSeconds: NaN, equivalentFlatTotalSeconds: NaN,
             paceFirstHalfSecsPerKm: NaN, paceSecondHalfSecsPerKm: NaN,
             exact800mSeconds: NaN, exact200mSeconds: NaN,
             estimatedHalfMarathonSeconds: NaN, estimatedHalfMarathonPaceSecsPerKm: NaN,
             recommendedIntervalPaceSecondsPerKm: NaN
         };
     }

    const totalHours = totalSeconds / 3600; // Total tid i timer
    const avgActualPaceSecondsPerKm = totalSeconds / distanceKm; // Gjennomsnittlig faktisk pace (sek/km)
    const speedKph = distanceKm / totalHours; // Gjennomsnittlig hastighet (km/t)

    // Beregn ekvivalent flat distanse ved å legge til "ekstra" distanse for høydemeter
    const equivalentFlatDistanceKm = Math.max(0.001, distanceKm + (elevationM / 1000) * ELEVATION_ADJUSTMENT_FACTOR);
    const avgAdjustedPaceSecondsPerKm = totalSeconds / equivalentFlatDistanceKm; // Gjennomsnittlig justert pace (GAP) (sek/km)

    const avgLapTimeSeconds = (avgActualPaceSecondsPerKm / 1000) * 400; // Gjennomsnittlig 400m rundetid (basert på faktisk pace)
    const equivalentFlatTotalSeconds = avgAdjustedPaceSecondsPerKm * distanceKm; // Total tid det *ville* tatt på flat mark med samme innsats

    // Beregn pace for første og andre halvdel ved negativ splitt
    const paceFirstHalfSecsPerKm = avgActualPaceSecondsPerKm * (1 + NEGATIVE_SPLIT_FACTOR);
    const paceSecondHalfSecsPerKm = avgActualPaceSecondsPerKm * (1 - NEGATIVE_SPLIT_FACTOR);

    // Beregn eksakt tid for 800m og 200m basert på justert pace (GAP)
    const exact800mSeconds = avgAdjustedPaceSecondsPerKm * 0.8;
    const exact200mSeconds = avgAdjustedPaceSecondsPerKm * 0.2;

    let estimatedHalfMarathonSeconds = NaN; // Initialiser til NaN
    let estimatedHalfMarathonPaceSecsPerKm = NaN; // Initialiser til NaN
    // Sjekk at basis for Riegel (justert tid og distanse) er gyldig
    if (Number.isFinite(equivalentFlatTotalSeconds) && equivalentFlatTotalSeconds > 0 && distanceKm > 0) {
        // Estimer halvmaratontid ved hjelp av Riegels formel basert på justert tid/innsats
        estimatedHalfMarathonSeconds = equivalentFlatTotalSeconds * Math.pow(HALF_MARATHON_KM / distanceKm, RIEGEL_EXPONENT);
        // Sjekk om HM-tid er gyldig før beregning av pace
        if (Number.isFinite(estimatedHalfMarathonSeconds) && estimatedHalfMarathonSeconds > 0) {
            estimatedHalfMarathonPaceSecsPerKm = estimatedHalfMarathonSeconds / HALF_MARATHON_KM; // Estimer pace for halvmaraton
        }
    }

    // Beregn anbefalt intervallpace (1000m) basert på estimert halvmaratonpace
    const recommendedIntervalPaceSecondsPerKm = Number.isFinite(estimatedHalfMarathonPaceSecsPerKm) && estimatedHalfMarathonPaceSecsPerKm > 0
        ? estimatedHalfMarathonPaceSecsPerKm - INTERVAL_PACE_ADJUSTMENT // 5 sek raskere enn HM-pace
        : NaN; // Sett til NaN hvis HM-pace ikke kunne beregnes eller er ugyldig

    // Returner alle beregnede verdier
    return {
        avgActualPaceSecondsPerKm, avgAdjustedPaceSecondsPerKm, speedKph,
        avgLapTimeSeconds, equivalentFlatTotalSeconds,
        paceFirstHalfSecsPerKm, paceSecondHalfSecsPerKm,
        exact800mSeconds, exact200mSeconds,
        estimatedHalfMarathonSeconds, estimatedHalfMarathonPaceSecsPerKm,
        recommendedIntervalPaceSecondsPerKm
    };
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
    // --- Formater og Vis Hovedresultater ---
    // Bruk Number.isFinite for å sikre at vi ikke prøver å formatere NaN/Infinity
    const formattedAvgActualPace = Number.isFinite(calculations.avgActualPaceSecondsPerKm) ? formatTimeMMSS(calculations.avgActualPaceSecondsPerKm, true) : "N/A";
    const formattedAvgAdjustedPace = Number.isFinite(calculations.avgAdjustedPaceSecondsPerKm) ? formatTimeMMSS(calculations.avgAdjustedPaceSecondsPerKm, true) : "N/A";
    const formattedAvgLapTime = Number.isFinite(calculations.avgLapTimeSeconds) ? formatTimeMMSS(calculations.avgLapTimeSeconds, false) : "N/A";
    const formattedSpeed = Number.isFinite(calculations.speedKph) ? calculations.speedKph.toFixed(2) : "N/A";
    const formattedExact800mTime = Number.isFinite(calculations.exact800mSeconds) ? formatTimeLong(calculations.exact800mSeconds) : "N/A";
    const formattedExact200mTime = Number.isFinite(calculations.exact200mSeconds) ? formatTimeLong(calculations.exact200mSeconds) : "N/A";

    paceResultSpan.textContent = `${formattedAvgActualPace} /km`;
    adjustedPaceResultSpan.textContent = `${formattedAvgAdjustedPace} /km`;
    adjustedPaceNoteSpan.textContent = hasElevation ? '(justert for stigning)' : ''; // Vis note hvis høydemeter > 0
    lapTimeResultSpan.textContent = formattedAvgLapTime;
    speedResultSpan.textContent = `${formattedSpeed} km/t`;
    time800mResultSpan.textContent = formattedExact800mTime;
    time200mResultSpan.textContent = formattedExact200mTime;

    // Vis info om negativ splitt pace hvis valgt og gyldig
    if (useNegativeSplit && distanceKm > 0 && Number.isFinite(calculations.paceFirstHalfSecsPerKm) && Number.isFinite(calculations.paceSecondHalfSecsPerKm)) {
        paceFirstHalfSpan.textContent = formatTimeMMSS(calculations.paceFirstHalfSecsPerKm, true);
        paceSecondHalfSpan.textContent = formatTimeMMSS(calculations.paceSecondHalfSecsPerKm, true);
        negativeSplitPacesInfoDiv.classList.remove('hidden');
    } else {
        negativeSplitPacesInfoDiv.classList.add('hidden');
    }

    // --- Vis Splittider / Løpsplan ---
    if (useNegativeSplit && Number.isFinite(calculations.paceFirstHalfSecsPerKm) && Number.isFinite(calculations.paceSecondHalfSecsPerKm)) {
        // Generer og vis løpsplan basert på negativ splitt
        generateAndDisplayNegativeSplitPlan(distanceKm, calculations.paceFirstHalfSecsPerKm, calculations.paceSecondHalfSecsPerKm);
    } else {
        // Generer og vis splittider basert på gjennomsnittlig pace
        generateAndDisplayAverageSplits(distanceKm, calculations.avgActualPaceSecondsPerKm, calculations.avgAdjustedPaceSecondsPerKm);
    }

    // --- Vis Prediksjoner ---
    generateAndDisplayPredictions(distanceKm, calculations.equivalentFlatTotalSeconds);

    // --- Vis Intervalltips ---
    const originalTotalSeconds = calculateTotalSeconds(originalTimeInputs);
    const formattedOriginalTime = Number.isFinite(originalTotalSeconds) ? formatTimeLong(originalTotalSeconds) : "N/A";
    const formattedEstimatedHmTime = Number.isFinite(calculations.estimatedHalfMarathonSeconds) ? formatTimeLong(calculations.estimatedHalfMarathonSeconds) : "N/A";
    const formattedEstimatedHmPace = Number.isFinite(calculations.estimatedHalfMarathonPaceSecsPerKm) ? formatTimeMMSS(calculations.estimatedHalfMarathonPaceSecsPerKm, false) : "N/A";
    const formattedRecommendedIntervalPace = Number.isFinite(calculations.recommendedIntervalPaceSecondsPerKm) ? formatTimeMMSS(calculations.recommendedIntervalPaceSecondsPerKm, false) : "N/A";

    intervalBasisDistanceSpan.textContent = `${distanceKm.toFixed(2)} km`; // Vis opprinnelig distanse
    intervalBasisTimeSpan.textContent = formattedOriginalTime; // Vis opprinnelig tid
    estimatedHmTimeSpan.textContent = formattedEstimatedHmTime; // Vis estimert HM-tid
    estimatedHmPaceSpan.textContent = formattedEstimatedHmPace; // Vis estimert HM-pace
    recommendedIntervalPaceSpan.textContent = formattedRecommendedIntervalPace; // Vis anbefalt intervallpace

    // Vis intervallseksjonen kun hvis anbefalt pace er gyldig og ikke "N/A"
     if (formattedRecommendedIntervalPace !== "N/A") {
         intervalSectionDiv.classList.remove('hidden');
     } else {
         intervalSectionDiv.classList.add('hidden');
     }

    // Vis hele resultatseksjonen
    resultsSection.classList.remove('hidden');
}


/**
 * Genererer og viser en løpsplan basert på negativ splitt.
 * @param {number} distanceKm - Total distanse.
 * @param {number} paceFirstHalf - Pace (sek/km) for første halvdel.
 * @param {number} paceSecondHalf - Pace (sek/km) for andre halvdel.
 */
function generateAndDisplayNegativeSplitPlan(distanceKm, paceFirstHalf, paceSecondHalf) {
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

        let currentPace; // Pace for dette segmentet
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
                    currentPace = NaN; // Sett til NaN hvis beregning feiler
                 }
            } else {
                 console.warn("Ugyldig distanse beregnet i splitt-kryssing");
                 currentPace = NaN; // Sett til NaN hvis beregning feiler
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

        // Hopp over hvis prediksjonen er ugyldig (f.eks. NaN)
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
    errorMessageDiv.textContent = message; // Sett tekstinnholdet i feilmeldings-div'en
    resultsSection.classList.add('hidden'); // Skjul resultatseksjonen
}

/** Fjerner feilmeldingen. */
function clearError() {
    errorMessageDiv.textContent = ''; // Tøm tekstinnholdet
}

/** Skjuler resultatseksjonen og tømmer alle resultatfelter. */
function hideResults() {
    resultsSection.classList.add('hidden'); // Skjul hovedseksjonen for resultater
    // Tøm innholdet i alle span-elementer som viser resultater
    paceResultSpan.textContent = '';
    adjustedPaceResultSpan.textContent = '';
    adjustedPaceNoteSpan.textContent = '';
    lapTimeResultSpan.textContent = '';
    speedResultSpan.textContent = '';
    time800mResultSpan.textContent = '';
    time200mResultSpan.textContent = '';
    negativeSplitPacesInfoDiv.classList.add('hidden'); // Skjul info om negativ splitt
    splitsListDiv.innerHTML = ''; // Tøm listen med splittider
    predictionsGridDiv.innerHTML = ''; // Tøm grid'en med prediksjoner
    splitsNote.classList.add('hidden'); // Skjul notat om splittider
    // Tøm felter i intervallseksjonen
    intervalBasisDistanceSpan.textContent = '';
    intervalBasisTimeSpan.textContent = '';
    estimatedHmTimeSpan.textContent = '';
    estimatedHmPaceSpan.textContent = '';
    recommendedIntervalPaceSpan.textContent = '';
    intervalSectionDiv.classList.add('hidden'); // Skjul intervallseksjonen
}

// --- Initialisering ---
// Kall handleDistanceChange() ved lasting for å sikre at riktig felt vises/skjules basert på startverdi.
handleDistanceChange();
console.log("Kalkulator initialisert."); // Debugging
