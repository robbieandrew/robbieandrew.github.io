let countryData = {};
let flatCountryData = [];
const IMAGE_PATH = 'https://robbieandrew.github.io/GCB2023/SVG/ctry/';
const IMAGE_TYPES = [
	{ prefix: 's20_Coal_Oil_Gas_Cement', extension: 'svg'}
];

// Fetch the JSON data
fetch('https://robbieandrew.github.io/data/countryData.json')
  .then(response => response.json())
  .then(data => {
    countryData = data;
	flatCountryData = Object.entries(countryData).map(
		([code, data]) => ({
			mainName: code,
			isoCode: data.isoCode,
			variants: [code, data.isoCode, ...data.variants]
			})
		);
    // Initialize autocomplete after data is loaded
    autocomplete(document.getElementById("countryInput"));
  })
  .catch(error => console.error('Error loading country data:', error));

function addDownloadLink(svgObject) {
  const container = svgObject.parentNode;
  // Create the link
  const downloadLink = document.createElement('a');
  downloadLink.href = '#';
  downloadLink.textContent = 'Download as PNG';
  downloadLink.className = 'download-PNG';
  // Add click event
  downloadLink.addEventListener('click', (e) => {
    e.preventDefault();
    downloadSVGasPNG(svgObject);
  });
  // Append the link after the SVG object
  container.appendChild(downloadLink);
}

function displayCountryImages(isoCode) {
  const imageContainer = document.getElementById("countryImages");
  imageContainer.innerHTML = ''; // Clear previous images

  IMAGE_TYPES.forEach(({ prefix, extension }) => {
    // if the file has extension svg, create an object, else create an img
    const imageElement = extension === 'svg' ? document.createElement("object") : document.createElement("img");
    
    imageElement.style.width = "600px";
    imageElement.style.margin = "10px";
    
    const imagePath = `${IMAGE_PATH}${prefix}_${isoCode}.${extension}`;
    
    if (extension === 'svg') {
      imageElement.data = imagePath;
      imageElement.type = "image/svg+xml";
      imageElement.className = "svg-object";
    } else {
      imageElement.src = imagePath;
      imageElement.alt = `${isoCode} Image ${prefix}`;
    }
    imageElement.onerror = () => {
      console.error(`Failed to load image: ${imagePath}`);
      imageElement.remove(); // Remove the failed image from DOM
    };

	// Create a new div to wrap the image
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "image-container";
    wrapperDiv.appendChild(imageElement);

    console.log(`Attempting to load: ${imagePath}`);
	// Add the new element to the page inside the container
    imageContainer.appendChild(wrapperDiv);

	// Add a PNG download link for every SVG on the page
	document.querySelectorAll('object[type="image/svg+xml"]').forEach(svgObject => {
	  svgObject.addEventListener('load', () => addDownloadLink(svgObject));
	});
	
  });
}

// Autocompletion code -----------------------------------------

/*function scoreMatch(variant, input) {
  const lowerVariant = variant.toLowerCase();
  const lowerInput = input.toLowerCase();
  
  if (lowerVariant.startsWith(lowerInput)) {
    return 100 - lowerVariant.length; // Prioritize shorter, exact matches
  } else if (lowerVariant.includes(lowerInput)) {
    return 50 - lowerVariant.indexOf(lowerInput); // Prioritize earlier matches
  }
  return 0; // No match
}*/
function scoreMatch(variant, input) {
  const lowerVariant = variant.toLowerCase();
  const lowerInput = input.toLowerCase();
  
  if (lowerVariant === lowerInput) {
    return 200; // Highest score for an exact match
  }
  
  if (lowerVariant.startsWith(lowerInput)) {
    return 150 - lowerVariant.length; // Strong priority for matches that start with the input
  } else if (lowerVariant.includes(lowerInput)) {
    return 50 - lowerVariant.indexOf(lowerInput); // Lower priority for partial matches
  }
  return 0; // No match
}

// Reduce the number of times the search function is called, especially for fast typers
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function autocomplete(inp) {
  const MAX_RESULTS = 10;
  let currentFocus = -1;
  
  const showResults = debounce((inputValue) => {
    const listContainer = document.getElementById("autocomplete-list");

	// Clear the list and hide it if the input is empty
	  if (!inputValue.trim()) {
		listContainer.innerHTML = '';
		listContainer.style.display = 'none';
		return;
	  }

    const lowerInput = inputValue.toLowerCase();
    // Score and sort the matches
    const scoredMatches = flatCountryData
      .map(item => {
        const bestVariantMatch = item.variants.reduce((best, variant) => {
          const score = scoreMatch(variant, lowerInput);
          return score > best.score ? { variant, score } : best;
        }, { variant: '', score: -1 });
        
        return { ...item, matchedVariant: bestVariantMatch.variant, score: bestVariantMatch.score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);

    listContainer.innerHTML = '';
    currentFocus = -1;

    if (scoredMatches.length > 0) {
      listContainer.style.display = 'block';
	  const fragment = document.createDocumentFragment();
      scoredMatches.forEach((item, index) => {
        const div = document.createElement("div");
        div.setAttribute('data-index', index);
        
        // Create main name element
        const mainNameSpan = document.createElement('span');
        mainNameSpan.style.fontWeight = 'bold';
        
        // Highlight matching part in main name
        const mainNameLower = item.mainName.toLowerCase();
        const matchIndex = mainNameLower.indexOf(lowerInput);
        if (matchIndex >= 0) {
		  const beforeMatch = item.mainName.substring(0, matchIndex);
		  const match = item.mainName.substr(matchIndex, inputValue.length);
		  const afterMatch = item.mainName.substring(matchIndex + inputValue.length);
		  mainNameSpan.innerHTML = `${beforeMatch}<strong>${match}</strong>${afterMatch}`;
        } else {
          mainNameSpan.textContent = item.mainName;
        }
        
        // Create variant element
        const variantSpan = document.createElement('span');
        variantSpan.style.fontSize = '0.8em';
        variantSpan.style.color = '#666';
        variantSpan.style.marginLeft = '0.5em';
        
        // Highlight matching part in variant
		const variantMatchIndex = item.matchedVariant.toLowerCase().indexOf(lowerInput);
		if (variantMatchIndex >= 0) {
		  const beforeMatch = item.matchedVariant.substring(0, variantMatchIndex);
		  const match = item.matchedVariant.substr(variantMatchIndex, inputValue.length);
		  const afterMatch = item.matchedVariant.substring(variantMatchIndex + inputValue.length);
		  variantSpan.innerHTML = `(${beforeMatch}<strong>${match}</strong>${afterMatch})`;
		} else {
		  variantSpan.textContent = `(${item.matchedVariant})`;
		}
        
        // Append both to the div
        div.appendChild(mainNameSpan);
        if (item.matchedVariant !== item.mainName.toLowerCase()) {
          div.appendChild(variantSpan);
        }

        div.addEventListener("click", function() {
          selectItem(item);
        });
        fragment.appendChild(div);
      });
      listContainer.appendChild(fragment);
    } else if (inputValue) {
      const noMatch = document.createElement("div");
      noMatch.innerHTML = '<i>No matches found</i>';
      noMatch.style.padding = '10px';
      noMatch.style.color = '#888';
      noMatch.style.cursor = 'default';
      listContainer.appendChild(noMatch);
    }
  }, 300);

  function selectItem(item) {
    inp.value = `${item.mainName} (${item.isoCode})`;
    closeDropdown();
    displayCountryImages(item.isoCode);
  }
  
  function closeDropdown() {
    const listContainer = document.getElementById("autocomplete-list");
    listContainer.innerHTML = '';
    listContainer.style.display = 'none';
    currentFocus = -1;
  }

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  inp.addEventListener("input", function() {
    showResults(this.value);
  });

  inp.addEventListener("keydown", function(e) {
    const listContainer = document.getElementById("autocomplete-list");
    let x = listContainer.getElementsByTagName("div");
    if (e.key === "ArrowDown") {
      currentFocus++;
      addActive(x);
    } else if (e.key === "ArrowUp") {
      currentFocus--;
      addActive(x);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      } else if (x.length > 0) {
        // If no item is focused, select the first item
        x[0].click();
      }
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  document.addEventListener("click", function(e) {
    if (e.target !== inp) {
      closeDropdown();
    }
  });
  
  inp.focus();
}

// Initialize
autocomplete(document.getElementById("countryInput"));

