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
    event.preventDefault(); // Forhindrer standard skjemainnsending (siderefresh)
    clearError(); // Fjern gamle feil først
    hideResults(); // Skjul gamle resultater

    // Bruk try-catch for generell feilhåndtering under beregningene
    try {
        const distanceKm = getSelectedDistance(); // Henter valgt/oppgitt distanse
        const elevationM = getElevation(); // Henter oppgitte høydemeter
        const timeInputs = getTimeInputs(); // Henter tid-input (timer, minutter, sekunder)
        const useNegativeSplit = negativeSplitToggle.checked; // Sjekker om negativ splitt er valgt

        // Validering sjekkes først
        if (!validateInputs(distanceKm, elevationM, timeInputs)) {
            return; // Stopp hvis validering feiler
        }

        const totalSeconds = calculateTotalSeconds(timeInputs); // Beregner total tid i sekunder

        // Sjekk total tid etter validering
        if (totalSeconds <= 0) {
            showError("Total tid må være større enn null.");
            return;
        }

        // Utfører alle løpsberegningene
        const calculations = performCalculations(distanceKm, elevationM, totalSeconds);

        // Sjekk for NaN (Not a Number) eller Infinity i kritiske beregninger før visning
        if (!Number.isFinite(calculations.avgActualPaceSecondsPerKm) ||
            !Number.isFinite(calculations.avgAdjustedPaceSecondsPerKm) ||
            !Number.isFinite(calculations.speedKph)) {
            showError("Kunne ikke beregne resultater. Sjekk inputverdiene.");
            return;
        }

        // Viser de beregnede resultatene på siden
        displayResults(calculations, distanceKm, totalSeconds, elevationM > 0, useNegativeSplit, timeInputs);

    } catch (error) {
        console.error("En uventet feil oppstod:", error); // Logg feilen til konsollen for debugging
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
    if (selection === 'custom') return parseFloat(customDistanceInput.value); // Hent fra egendefinert felt
    if (selection === 'preset') return NaN; // Ingen distanse valgt
    return parseFloat(selection); // Hent fra forhåndsinnstilt verdi
}

/**
 * Henter antall høydemeter fra input-feltet.
 * @returns {number} Antall høydemeter (standard 0).
 */
function getElevation() {
    const elevationStr = elevationInput.value.trim() || '0'; // Hent verdi, bruk '0' hvis tomt
    return parseFloat(elevationStr);
}

/**
 * Henter verdiene fra tid-inputfeltene (timer, minutter, sekunder).
 * @returns {object} Et objekt med tid-verdiene som strenger.
 */
function getTimeInputs() {
    return {
        hours: hoursInput.value.trim() || '0', // Hent timer, bruk '0' hvis tomt
        minutes: minutesInput.value.trim() || '0', // Hent minutter, bruk '0' hvis tomt
        seconds: secondsInput.value.trim() || '0' // Hent sekunder, bruk '0' hvis tomt
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
    if (isNaN(distanceKm) || distanceKm <= 0) { showError("Ugyldig eller manglende distanse."); return false; }
    if (isNaN(elevationM) || elevationM < 0) { showError("Ugyldig verdi for høydemeter."); return false; }
    const hours = parseFloat(timeInputs.hours);
    const minutes = parseFloat(timeInputs.minutes);
    const seconds = parseFloat(timeInputs.seconds);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) { showError("Tidsfeltene må inneholde gyldige tall."); return false; }
    if (hours < 0 || minutes < 0 || seconds < 0) { showError("Tidsverdier kan ikke være negative."); return false; }
    if (minutes >= 60 || seconds >= 60) { showError("Minutter og sekunder må være under 60."); return false; }
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
    const seconds = parseFloat(timeInputs.seconds);
    // Sikre at resultatet er et gyldig tall
    const total = (hours * 3600) + (minutes * 60) + seconds;
    return isNaN(total) ? 0 : total; // Returner 0 hvis beregningen gir NaN
}

/**
 * Utfører alle nødvendige løpsberegninger.
 * @param {number} distanceKm - Distanse i km.
 * @param {number} elevationM - Høydemeter.
 * @param {number} totalSeconds - Total tid i sekunder.
 * @returns {object} Et objekt som inneholder alle beregnede verdier.
 */
function performCalculations(distanceKm, elevationM, totalSeconds) {
    // Sikre at input er gyldig før beregning
     if (distanceKm <= 0 || totalSeconds <= 0) {
         // Returner et objekt med NaN for å indikere feil hvis input er ugyldig
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
    // Bruker Math.max for å unngå 0 eller negativ distanse hvis elevationM er 0 eller negativ (selv om validert)
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
    if (equivalentFlatTotalSeconds > 0 && distanceKm > 0) {
        // Estimer halvmaratontid ved hjelp av Riegels formel basert på justert tid/innsats
        estimatedHalfMarathonSeconds = equivalentFlatTotalSeconds * Math.pow(HALF_MARATHON_KM / distanceKm, RIEGEL_EXPONENT);
        estimatedHalfMarathonPaceSecsPerKm = estimatedHalfMarathonSeconds / HALF_MARATHON_KM; // Estimer pace for halvmaraton
    }

    // Beregn anbefalt intervallpace (1000m) basert på estimert halvmaratonpace
    const recommendedIntervalPaceSecondsPerKm = estimatedHalfMarathonPaceSecsPerKm > 0
        ? estimatedHalfMarathonPaceSecsPerKm - INTERVAL_PACE_ADJUSTMENT // 5 sek raskere enn HM-pace
        : NaN; // Sett til NaN hvis HM-pace ikke kunne beregnes

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
    const formattedAvgActualPace = formatTimeMMSS(calculations.avgActualPaceSecondsPerKm, true); // mm:ss.s
    const formattedAvgAdjustedPace = formatTimeMMSS(calculations.avgAdjustedPaceSecondsPerKm, true); // mm:ss.s
    const formattedAvgLapTime = formatTimeMMSS(calculations.avgLapTimeSeconds, false); // mm:ss
    const formattedSpeed = calculations.speedKph.toFixed(2); // To desimaler
    const formattedExact800mTime = formatTimeLong(calculations.exact800mSeconds); // h:mm:ss eller m:ss
    const formattedExact200mTime = formatTimeLong(calculations.exact200mSeconds); // h:mm:ss eller m:ss

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
    const formattedOriginalTime = formatTimeLong(calculateTotalSeconds(originalTimeInputs)); // Formater opprinnelig tid
    const formattedEstimatedHmTime = formatTimeLong(calculations.estimatedHalfMarathonSeconds); // Formater estimert HM-tid
    const formattedEstimatedHmPace = formatTimeMMSS(calculations.estimatedHalfMarathonPaceSecsPerKm, false); // Formater estimert HM-pace
    const formattedRecommendedIntervalPace = formatTimeMMSS(calculations.recommendedIntervalPaceSecondsPerKm, false); // Formater anbefalt intervallpace

    intervalBasisDistanceSpan.textContent = `${distanceKm.toFixed(2)} km`; // Vis opprinnelig distanse
    intervalBasisTimeSpan.textContent = formattedOriginalTime; // Vis opprinnelig tid
    estimatedHmTimeSpan.textContent = formattedEstimatedHmTime; // Vis estimert HM-tid
    estimatedHmPaceSpan.textContent = formattedEstimatedHmPace; // Vis estimert HM-pace
    recommendedIntervalPaceSpan.textContent = formattedRecommendedIntervalPace; // Vis anbefalt intervallpace

    // Vis intervallseksjonen kun hvis anbefalt pace er gyldig
     if (calculations.recommendedIntervalPaceSecondsPerKm > 0 && Number.isFinite(calculations.recommendedIntervalPaceSecondsPerKm)) {
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
    if (distanceKm <= 0 || !Number.isFinite(paceFirstHalf) || !Number.isFinite(paceSecondHalf)) {
        splitsContainer.classList.add('hidden'); // Skjul splitt-container hvis ugyldig
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
            const timeFirstPart = distFirstHalf * paceFirstHalf; // Tid i første del
            const timeSecondPart = distSecondHalf * paceSecondHalf; // Tid i andre del
            currentPace = (timeFirstPart + timeSecondPart) / kmDistance; // Beregn gjennomsnittspace for segmentet
        }

        const kmSeconds = kmDistance * currentPace; // Tid for dette segmentet
        accumulatedSeconds += kmSeconds; // Legg til i akkumulert tid

        // Formater tidene for visning
        const formattedPace = formatTimeMMSS(currentPace, true);
        const formattedAccumulatedTime = formatTimeLong(accumulatedSeconds);

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
    if (distanceKm <= 0 || !Number.isFinite(avgActualPaceSecondsPerKm) || !Number.isFinite(avgAdjustedPaceSecondsPerKm)) {
        splitsContainer.classList.add('hidden'); // Skjul splitt-container hvis ugyldig
        return;
    }
    splitsContainer.classList.remove('hidden'); // Vis splitt-container
    const fullKms = Math.floor(distanceKm); // Antall hele kilometer

    // Generer splittider for hver hele kilometer
    for (let km = 1; km <= fullKms; km++) {
        const actualSplitTimeSeconds = km * avgActualPaceSecondsPerKm; // Akkumulert faktisk tid
        const adjustedSplitTimeSeconds = km * avgAdjustedPaceSecondsPerKm; // Akkumulert justert tid
        const formattedActualSplitTime = formatTimeLong(actualSplitTimeSeconds);
        const formattedAdjustedSplitTime = formatTimeLong(adjustedSplitTimeSeconds);

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
        const formattedFinalActualTime = formatTimeLong(finalActualTimeSeconds);
        const formattedFinalAdjustedTime = formatTimeLong(finalAdjustedTimeSeconds);

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
        if (equivalentFlatTotalSeconds <= 0 || currentDistanceKm <= 0 || !Number.isFinite(equivalentFlatTotalSeconds)) return;

        // Beregn predikert tid med Riegels formel
        const predictedSeconds = equivalentFlatTotalSeconds * Math.pow(targetDistance.value / currentDistanceKm, RIEGEL_EXPONENT);

        // Hopp over hvis prediksjonen er ugyldig (f.eks. NaN)
        if (!Number.isFinite(predictedSeconds)) return;

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
 * Formaterer totalt antall sekunder til "m:ss" eller "m:ss.s" format.
 * @param {number} totalSeconds - Antall sekunder.
 * @param {boolean} [includeMillis=false] - Om millisekunder (en desimal) skal inkluderes.
 * @returns {string} Formattert tidstreng, eller "Ugyldig".
 */
function formatTimeMMSS(totalSeconds, includeMillis = false) {
    if (!Number.isFinite(totalSeconds)) return "Ugyldig"; // Returner "Ugyldig" hvis input er NaN eller Infinity
    if (totalSeconds <= 0) return includeMillis ? "0:00.0" : "0:00"; // Håndter null eller negativ tid

    let minutes = Math.floor(totalSeconds / 60);
    let remainingSeconds = totalSeconds % 60;

    // Korriger for små negative tall pga. flyttallspresisjon
    if (remainingSeconds < 0 && remainingSeconds > -1e-9) remainingSeconds = 0;

    // Håndter tilfeller der sekunder runder opp til 60
    let secondsPart = Math.floor(remainingSeconds);
    let millisPart = Math.round((remainingSeconds - secondsPart) * 10); // Rund av millisekunder

    if (millisPart === 10) {
        millisPart = 0;
        secondsPart += 1;
    }
    if (secondsPart === 60) {
        secondsPart = 0;
        minutes += 1;
    }

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
 * @returns {string} Formattert tidstreng, eller "Ugyldig".
 */
function formatTimeLong(totalSeconds) {
    if (!Number.isFinite(totalSeconds)) return "Ugyldig"; // Returner "Ugyldig" hvis input er NaN eller Infinity
    if (totalSeconds <= 0) return "0:00"; // Håndter null eller negativ tid

    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    // Rund av sekunder til nærmeste hele tall for denne visningen
    let seconds = Math.round(totalSeconds % 60);

    // Håndter overflyt fra sekunder til minutter, og minutter til timer
    if (seconds === 60) {
        seconds = 0;
        minutes += 1;
    }
    if (minutes === 60) {
        minutes = 0;
        hours += 1;
    }

    // Formater minutter og sekunder med ledende null hvis nødvendig
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    // Bygg strengen basert på om timer eller minutter er større enn 0
    if (hours > 0) {
        return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    } else if (minutes > 0) {
        return `${minutes}:${formattedSeconds}`;
    } else {
        // Vis "0:ss" for tider under ett minutt
        return `0:${formattedSeconds}`;
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
