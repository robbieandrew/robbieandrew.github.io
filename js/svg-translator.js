let cachedTranslations = null;

async function applyTranslation(langCode) {
    // 1. Handle English (Reset)
    if (langCode === 'en') {
        document.querySelectorAll('object[type="image/svg+xml"]').forEach(obj => {
            const svgDoc = obj.contentDocument;
            if (!svgDoc) return;
            svgDoc.querySelectorAll('text, tspan').forEach(el => {
                if (el.hasAttribute('data-orig-text')) {
                    el.textContent = el.getAttribute('data-orig-text');
                    el.style.fontFamily = ''; // Reset font
					el.style.letterSpacing = 'normal'; 
                }
            });
        });
        return;
    }

    // 2. Fetch the JSON if we haven't already
    if (!cachedTranslations) {
        try {
            const response = await fetch('../data/carsales-translations.json');
            cachedTranslations = await response.json();
        } catch (error) {
            console.error("Could not load translations:", error);
            return;
        }
    }

    // 3. Process every SVG object on the page
    document.querySelectorAll('object[type="image/svg+xml"]').forEach(obj => {
        const svgDoc = obj.contentDocument;
        if (!svgDoc) return;

		// Japanese Font Fix: Use "UI" versions for tighter horizontal spacing
		if (langCode === 'ja') {
			svgDoc.querySelectorAll('text, tspan').forEach(t => {
				// "Yu Gothic UI" and "Meiryo UI" use proportional spacing for Katakana
				t.style.fontFamily = '"Yu Gothic UI", "Meiryo UI", "Hiragino Kaku Gothic ProN", sans-serif';
				t.style.letterSpacing = '-0.05em'; // Optional: slightly tighten the "air" between characters
			});
		} else {
			// RESET: Switch back to standard spacing and original font for all other languages
			svgDoc.querySelectorAll('text, tspan').forEach(t => {
				t.style.fontFamily = ''; 
				t.style.letterSpacing = 'normal'; 
			});
		}
        svgDoc.querySelectorAll('text, tspan').forEach(el => {
            // Save original English text if not already saved
            if (!el.hasAttribute('data-orig-text')) {
                el.setAttribute('data-orig-text', el.textContent.trim());
            }
            
		let translatedText = el.getAttribute('data-orig-text');

		// 1. Sort keys by length: Longest first (e.g., "Non-plugin hybrid" before "in ")
		const sortedKeys = Object.keys(cachedTranslations).sort((a, b) => b.length - a.length);

		for (let englishKey of sortedKeys) {
			const targetWord = cachedTranslations[englishKey][langCode];
			
			if (targetWord !== undefined) {
				// 2. Use word boundaries (\b) for keys that are just words (like "in" or "new")
				// This prevents matching "in" inside "Bensin"
				// If the key contains special characters (like " / "), we skip boundaries
				const needsBoundaries = /^\w+$/.test(englishKey.trim());
				const regexString = needsBoundaries ? `\\b${englishKey.trim()}\\b` : englishKey;
				
				const regex = new RegExp(regexString, 'g'); 
				
				if (regex.test(translatedText)) {
					regex.lastIndex = 0; // Reset regex state
					translatedText = translatedText.replace(regex, targetWord);
				}
			}
		}
		el.textContent = translatedText;
        });
    });
}