/* Create an invisible metadata element directly under each SVG object that provides a semicolon-separated list of all the text objects in the SVG image. The hope is that will assist search engines understand the page content.
*/
function addSVGmetadata(svgObject) {
	const svgDoc = svgObject.contentDocument;
	if (!svgDoc) return;

    // Check if the metadata span already exists as the next sibling
	const container = svgObject.parentNode;
    const existingMetadata = container.querySelector('.chart-metadata');
    if (existingMetadata) {
      return; // If it exists, do nothing and exit the function.
    }
	
	// Use a Set to retain only unique strings
	const texts = new Set();

	// 1. Get the <title> if it exists
	const titleEl = svgDoc.querySelector("title");
	if (titleEl?.textContent) {
	  texts.add(titleEl.textContent.trim());
	}

	// 2. Get all <text> elements
	svgDoc.querySelectorAll("text").forEach(textEl => {
	  const classList = textEl.classList;

	  // Skip if has class ticklabel ytl (vertical ticks)
	  if (classList.contains("ticklabel") && classList.contains("ytl")) return;

	  // Skip if class starts with dp (e.g., dp1, dp2) = datatips
	  for (const cls of classList) {
		if (cls.startsWith("dp")) return;
	  }

	  // Extract plain text (no nested tags like <a>)
	  const rawText = textEl.textContent?.trim();
	  if (!rawText) return;

	  // Filter out purely numeric or trivial values
	  if (/^[\d.,%]+$/.test(rawText)) return;

	  texts.add(rawText);
	});

	if (texts.size > 0) {
	  const hiddenSpan = document.createElement("span");
	  hiddenSpan.className = "chart-metadata";
	  hiddenSpan.textContent = Array.from(texts).join("; ") + ";";
	  svgObject.insertAdjacentElement("afterend", hiddenSpan);
	}
}
