// SVG translation engine: template-based for title phrases, greedy replacer for everything else
// April 2026
const DEV_MODE = true; // set to false before deploying
let cachedTranslations = null;  // flat key→lang map for the greedy replacer (carsales + country merged)
let cachedCountries = null;     // country key→lang map, kept separate for assembleTitle()
let titleTemplates = null;      // structured slot/assembly data from title-templates.json

function fetchWithCache(url) {
    return fetch(DEV_MODE ? url + '?v=' + Date.now() : url);
}

// Helper to escape special regex characters like . / ( ) +
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

function assembleTitle(slots, langCode) {
    const { period, metric, vehicle, vehicle_condition } = slots;
    const t = titleTemplates;

    const get = (slotName, value) =>
        t.slots[slotName]?.[value]?.[langCode]
        ?? t.slots[slotName]?.[value]?.['en']
        ?? value; // fallback to English if slot missing for this lang

    // For fr and it, vehicle_condition must agree in gender with the vehicle noun.
    // The vehicle slot carries a {lang}_gender flag; vehicle_condition has {lang_m}/{lang_f} forms.
    const getCondition = () => {
        if (!vehicle_condition) return null;
        // Finnish "ensirekisteröinnit" and German "Neuzulassungen von" already encode
        // new/first registration, so suppress vehicle_condition=new for those languages
        // when metric=registrations.
        if ((langCode === 'fi' || langCode === 'de') && metric === 'registrations' && vehicle_condition === 'new') return null;
        const cond = t.slots.vehicle_condition[vehicle_condition];
        if (!cond) return null;
        if (langCode === 'fr' || langCode === 'it') {
            const gender = t.slots.vehicle[vehicle]?.[`${langCode}_gender`] ?? 'm';
            return cond[`${langCode}_${gender}`] ?? cond[langCode] ?? vehicle_condition;
        }
        return cond[langCode] ?? vehicle_condition;
    };

    // For pl, period must agree in gender with the metric noun.
    // For fi, period must agree in number (singular/plural) with the metric noun.
    // Both use flags on the metric slot to drive the lookup.
    const getPeriod = () => {
        if (langCode === 'pl') {
            const gender = t.slots.metric[metric]?.['pl_gender'] ?? 'f';
            return t.slots.period[period]?.[`pl_${gender}`] ?? get('period', period);
        }
        if (langCode === 'fi') {
            const number = t.slots.metric[metric]?.['fi_number'] ?? 's';
            return t.slots.period[period]?.[`fi_${number}`] ?? get('period', period);
        }
        return get('period', period);
    };

    const parts = {
        period:            getPeriod(),
        metric:            get('metric', metric),
        vehicle:           get('vehicle', vehicle),
        vehicle_condition: getCondition(),
        country:           cachedCountries[slots.country]?.[langCode] ?? slots.country,
        separator:         t.slots.separator?.[langCode] ?? t.slots.separator._default,
    };

    const pattern = t.assembly[langCode] ?? t.assembly._default;

    return pattern
        .replace('{period}',             parts.period)
        .replace('{metric}',             parts.metric)
        .replace('{vehicle_condition?}', parts.vehicle_condition ? ' ' + parts.vehicle_condition : '')
        .replace('{vehicle}',            parts.vehicle)
        .replace('{separator}',          parts.separator)
        .replace('{country}',            parts.country)
        .trim()
        .replace(/\s{2,}/g, ' '); // collapse any double spaces from absent optional slots
}

// Determine the structure of the title text to assist translation
function parseTitleToSlots(text) {
    const periods = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];
    const metrics = {
        'sales of new ':       { metric: 'sales',         vehicle_condition: 'new' },
        'sales of used ':      { metric: 'sales',         vehicle_condition: 'used' },
        'sales of ':           { metric: 'sales',         vehicle_condition: null },
        'imports of new ':     { metric: 'imports',       vehicle_condition: 'new' },
        'imports of used ':    { metric: 'imports',       vehicle_condition: 'used' },
        'imports of ':         { metric: 'imports',       vehicle_condition: null },
        'registrations of ':   { metric: 'registrations', vehicle_condition: null },
    };
    const vehicles = [
        'passenger cars',
        'light commercial vehicles',
        'light-duty vehicles',
        'heavy-duty vehicles',
        'light- and medium-duty vehicles',
    ];

    // Step 1: extract period
    const period = periods.find(p => text.startsWith(p));
    if (!period) return null;
    let remainder = text.slice(period.length + 1); // +1 for the space

    // Step 2: extract metric phrase (longest match first)
    const metricKey = Object.keys(metrics)
        .sort((a, b) => b.length - a.length)
        .find(k => remainder.startsWith(k));
    if (!metricKey) return null;
    const { metric, vehicle_condition } = metrics[metricKey];
    remainder = remainder.slice(metricKey.length);

    // Step 3: extract vehicle type
    const vehicle = vehicles
        .sort((a, b) => b.length - a.length)
        .find(v => remainder.startsWith(v));
    if (!vehicle) return null;
    remainder = remainder.slice(vehicle.length);

    // Step 4: extract country (expects ": Country")
    const countryMatch = remainder.match(/^:\s*(.+)$/);
    if (!countryMatch) return null;
    const country = countryMatch[1].trim();

    return { period, metric, vehicle_condition, vehicle, country };
}

async function applyTranslation(langCode) {
    // 1. Handle English (Reset)
    if (langCode === 'en') {
        document.querySelectorAll('object[type="image/svg+xml"]').forEach(obj => {
            const svgDoc = obj.contentDocument;
            if (!svgDoc) return;
            svgDoc.querySelectorAll('text, tspan').forEach(el => {
                if (el.hasAttribute('data-orig-text')) {
                    el.textContent = el.getAttribute('data-orig-text');
                    el.style.fontFamily = ''; 
                    el.style.letterSpacing = 'normal'; 
                }
            });
        });
        return;
    }

    // 2. Fetch the JSONs if we haven't already
    if (!cachedTranslations) {
        try {
            const [carRes, countryRes, templateRes] = await Promise.all([
                fetchWithCache('../data/carsales-translations.json'),
                fetchWithCache('../data/country-translations.json'),
                fetchWithCache('../data/title-templates.json')
            ]);

            const carData     = await carRes.json();
            const countryData = await countryRes.json();
            titleTemplates    = await templateRes.json();

            // Country data is kept separate so assembleTitle() can look up countries
            // without them polluting the greedy replacer's key pool
            cachedCountries     = countryData;
            cachedTranslations  = { ...countryData, ...carData };
            
        } catch (error) {
            console.error("Could not load translations:", error);
            return;
        }
    }
	
    // 3. Process every SVG object on the page
    document.querySelectorAll('object[type="image/svg+xml"]').forEach(obj => {
        const svgDoc = obj.contentDocument;
        if (!svgDoc) return;

        // Japanese Font Fix
        if (langCode === 'ja') {
            svgDoc.querySelectorAll('text, tspan').forEach(t => {
                t.style.fontFamily = '"Yu Gothic UI", "Meiryo UI", "Hiragino Kaku Gothic ProN", sans-serif';
                t.style.letterSpacing = '-0.05em'; // Slightly tighter spacing
            });
		} else if (langCode === 'ko') {
			svgDoc.querySelectorAll('text, tspan').forEach(t => {
				t.style.fontFamily = '"Malgun Gothic", "Apple SD Gothic Neo", "NanumGothic", sans-serif';
				t.style.letterSpacing = '-0.05em'; // Slightly tighter spacing
			});
		} else {
            svgDoc.querySelectorAll('text, tspan').forEach(t => {
                t.style.fontFamily = ''; 
                t.style.letterSpacing = 'normal'; 
            });
        }

        svgDoc.querySelectorAll('text, tspan').forEach(el => {
            if (!el.hasAttribute('data-orig-text')) {
                el.setAttribute('data-orig-text', el.textContent);
            }

            // --- Template path (titles) ---
            // Prefer explicit data-title-slots attribute; fall back to parsing the English text.
            // If either succeeds, assemble the translation directly and skip the greedy replacer.
            let slots = null;
            if (el.hasAttribute('data-title-slots')) {
                try { slots = JSON.parse(el.getAttribute('data-title-slots')); }
                catch (e) { console.warn('Malformed data-title-slots:', el.getAttribute('data-title-slots')); }
            }
            if (!slots) {
                slots = parseTitleToSlots(el.getAttribute('data-orig-text'));
            }
            if (slots && titleTemplates) {
                el.textContent = assembleTitle(slots, langCode);
                return; // done with this element
            }

            // --- Greedy replacer path (everything else) ---
		let textToProcess = el.getAttribute('data-orig-text');
		const sortedKeys = Object.keys(cachedTranslations).sort((a, b) => b.length - a.length);
		const replacementsMap = new Map();
		let count = 0;

		for (let englishKey of sortedKeys) {
			const targetWord = cachedTranslations[englishKey][langCode];
			
			if (targetWord !== undefined) {
				const escapedKey = escapeRegExp(englishKey); 
				const regex = new RegExp(escapedKey, 'g');

				// If a match is found, replace it with a unique placeholder like {{0}}
				// This prevents the loop from seeing "Hybride" and turning it into "Hybridee"
				// That is, any text that is matched and translated will not be translated again.
				if (regex.test(textToProcess)) {
					textToProcess = textToProcess.replace(regex, () => {
						const placeholder = `{{TR_${count}}}`;
						replacementsMap.set(placeholder, targetWord);
						count++;
						return placeholder;
					});
				}
			}
		}

		// Final Pass: Replace placeholders with the actual translated text
		replacementsMap.forEach((actualTranslation, placeholder) => {
			textToProcess = textToProcess.replace(new RegExp(escapeRegExp(placeholder), 'g'), actualTranslation);
		});

		el.textContent = textToProcess;
        });
    });
}