// A Greedy, multi-pass string replacement engine
// April 2026
let cachedTranslations = null;

// Helper to escape special regex characters like . / ( ) +
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
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
            const [carRes, countryRes] = await Promise.all([
                fetch('../data/carsales-translations.json'),
                fetch('../data/country-translations.json')
            ]);

            const carData = await carRes.json();
            const countryData = await countryRes.json();
            cachedTranslations = { ...countryData, ...carData};
            
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