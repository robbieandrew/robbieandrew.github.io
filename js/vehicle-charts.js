// This prevents downloadSVGasPNG.js from making guessed requests
var availableDataFiles = "SkipDataDownloadLink";
// Variable to track initial load. Must be global
window.svgsToLoad = 0;
let isInitialSetup = true;
let tsInstances = [];
const btn = document.getElementById('tally-feedback-btn');

// Global detection: Modern iPads + older iPads/iPhones
// I have to be careful with some steps because on iPad it creates a race condition and hangs
const isTouchDevice = (
  ('ontouchstart' in window) || 
  (navigator.maxTouchPoints > 0) || 
  (navigator.msMaxTouchPoints > 0)
);

// Global safety timer
let loaderSafetyTimeout;

function startLoaderTimeout() {
    // If the loader is still there after 25 seconds, force it away.
    loaderSafetyTimeout = setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if (loader && loader.style.display !== 'none') {
            console.warn("Loader safety timeout: Forcing page reveal.");
            hidePageLoader();
        }
    }, 25000); 
}
// Call immediately on page load
startLoaderTimeout();


btn.addEventListener('click', function(e) {
  // Only apply this logic on mobile
  if (window.innerWidth <= 600) {
    if (!btn.classList.contains('expanded')) {
      e.preventDefault(); // Stop Tally from opening
      e.stopPropagation();
      btn.classList.add('expanded');
    }
  }
});

function toggleFeedback(show) {
  const btn = document.getElementById('tally-feedback-btn');
  if (!show) {
    btn.classList.remove('expanded');
  }
}

function updateCharts() {
    const activeCountries = document.querySelectorAll('.country[style*="display: block"]');
    
    // Use the Tom Select instance if available to check the value
    const countrySelector = document.getElementById('countrySelector');
    const tsControl = countrySelector ? countrySelector.tomselect : null;
    const selectedValues = tsControl ? tsControl.getValue() : [];
    const isAllSelected = Array.isArray(selectedValues) ? selectedValues.includes('all') : selectedValues === 'all';

	if (isAllSelected || activeCountries.length > 10) {
		// Only reset the loader if we are actually changing things after the first load
        if (!isInitialSetup) {
            window.svgsToLoad = activeCountries.length; 
			log('general',`updateCharts: svgsToLoad is now ${window.svgsToLoad}`)
            showPageLoader();
        }
    }

    const activeFrequency = document.getElementById('frequencySelector').value;
    const activeFormat = document.getElementById('formatSelector').value;
    const currentLang = document.getElementById('langSelector').value;
	
    activeCountries.forEach(container => {
        const country = container.dataset.country.toLowerCase().replace(/\s+/g, '');
        const wrapper = container.querySelector('.chart-wrapper');
        const formatSuffix = activeFormat === 'absolute' ? '_abs' : activeFormat === 'line' ? '_line' : '';
        const newSvgPath = `img/${country}_${DATASET}_${activeFrequency}${formatSuffix}.svg`;

        wrapper.innerHTML = ''; 
        const newObj = document.createElement('object');
        newObj.type = 'image/svg+xml';
        newObj.className = 'fig';
        newObj.data = newSvgPath;

		newObj.onload = function() {
			if (typeof applyTranslation === "function") {
				applyTranslation(currentLang);
			}
			attachChartButtons(container, newObj); // This calls decrementLoader
			newObj.onload = null;
		};

		// If the file is missing, we still need to count down
		newObj.onerror = function() {
			console.warn("Chart failed to load: " + newSvgPath);
			decrementLoader(); 
			newObj.onerror = null;
};
        wrapper.appendChild(newObj);
    });
}



function makeCountrySelector() {
    const allCountryDivs = document.querySelectorAll('.country');
    const selectElement = document.getElementById('countrySelector');
    const countries = new Set();

    allCountryDivs.forEach(graph => {
        countries.add(graph.dataset.country);
    });

    // Initial setup of the <select> element
    selectElement.innerHTML = `<option value="all">All Countries</option>`;
    Array.from(countries).sort().forEach(country => {
        selectElement.innerHTML += `<option value="${country}">${country}</option>`;
    });

    const totalCount = countries.size;
    document.getElementById("totalCount").textContent = totalCount;

    const countryControl = new TomSelect("#countrySelector", {
        plugins: ['remove_button'],
        maxOptions: null, 
        persist: false,
        create: false,
        placeholder: "Select or search...",
        allowEmptyOption: true,
        hideSelected: true, // This makes selected countries disappear from the list
        
        onItemAdd: function(value) {
            // Logic: If you select a specific country, remove the "All Countries" pill
            if (value !== 'all') {
                this.removeItem('all', true); // 'true' makes it silent to avoid loops
            }
            this.setTextboxValue('');
            this.refreshOptions(false);
        },

		onInitialize: function() {
			const urlParams = new URLSearchParams(window.location.search);
			const countryParam = urlParams.get('country');

			if (countryParam && countryParam !== 'all') {
				const countriesToSelect = countryParam.split(',').map(s => s.trim());

				// Build a case-insensitive lookup map from actual option values
				const optionMap = {};
				Object.keys(this.options).forEach(key => {
					optionMap[key.toLowerCase()] = key; // e.g. 'iceland' -> 'Iceland'
				});

				// Resolve each URL token to the real option value (or drop it if unknown)
				const resolved = countriesToSelect
					.map(c => optionMap[c.toLowerCase()])
					.filter(Boolean);

				if (resolved.length > 0) {
					triggerMassLoad(resolved.length);
					this.setValue(resolved);
				} else {
					// No valid countries found — fall back to all
					console.warn('No valid countries matched in URL, defaulting to all.');
					this.setValue('all');
				}
			} else {
				this.setValue('all');
			}
		},
		
		onChange: function(value) {
			const control = this;
			// Small delay to ensure TomSelect has updated the UI/URL state
			setTimeout(() => {
				let selectedOptions = Array.isArray(value) ? value : [value];
				
				// FORCE CLEANUP: If 'all' is present with other items, prioritize
				if (selectedOptions.length > 1) {
					if (selectedOptions[selectedOptions.length - 1] === 'all') {
						// If 'all' was the LAST thing added, remove everything else
						control.clear(true);
						control.addItem('all', true);
						selectedOptions = ['all'];
					} else if (selectedOptions.includes('all')) {
						// If a specific country was added while 'all' existed, remove 'all'
						control.removeItem('all', true);
						selectedOptions = selectedOptions.filter(opt => opt !== 'all');
					}
				}
				
				const allDivsArray = Array.from(allCountryDivs);
				
				// 1. Calculate exactly how many charts will be processed in this cycle
				// This includes all countries if "all" is selected, or a specific subset.
				const visibleDivsCount = allDivsArray.filter(div => 
					selectedOptions.includes('all') || selectedOptions.includes(div.dataset.country)
				).length;

				// 2. Set the global counter and show the loader
				// We use triggerMassLoad for large batches to show the spinner
				if (visibleDivsCount > 10) {
					triggerMassLoad(visibleDivsCount);
				} else {
					// Still set the variable so decrementLoader doesn't log "is zero"
					window.svgsToLoad = visibleDivsCount;
				}

				// 3. Update the URL to reflect the current selection
				const url = new URL(window.location);
				url.searchParams.set('country', selectedOptions.includes('all') ? 'all' : selectedOptions.join(','));
				window.history.pushState({}, '', url);

				// 4. Get current settings for the chart paths
				const activeFreq = document.getElementById('frequencySelector').value;
				const activeFormat = document.getElementById('formatSelector').value;
				const formatSuffix = activeFormat === 'absolute' ? '_abs' : activeFormat === 'line' ? '_line' : '';
				const currentLang = document.getElementById('langSelector').value;

				// 5. The main loop to show/hide and load charts
				allCountryDivs.forEach(div => {
					const isVisible = selectedOptions.includes('all') || selectedOptions.includes(div.dataset.country);
					const wrapper = div.querySelector('.chart-wrapper');
					
					if (isVisible) {
						div.style.display = 'block';

						// With fewer than 3 charts shown, switch from 3 columns to 2 columns
						if (visibleDivsCount < 3) {
							div.classList.remove('pure-u-lg-1-3');
							div.classList.add('pure-u-lg-1-2');
						} else {
							div.classList.remove('pure-u-lg-1-2');
							div.classList.add('pure-u-lg-1-3');
						}

						const cleanName = div.dataset.country.toLowerCase().replace(/\s+/g, '');
						const targetPath = `img/${cleanName}_${DATASET}_${activeFreq}${formatSuffix}.svg`;
						const currentObj = wrapper.querySelector('object');
						
						// If the object doesn't exist or has the wrong data path, create/replace it
						if (!currentObj || currentObj.getAttribute('data') !== targetPath) {
							wrapper.innerHTML = ''; 
							const newObj = document.createElement('object');
							newObj.type = 'image/svg+xml';
							newObj.className = 'fig';
							newObj.data = targetPath;
							
							newObj.onload = function() {
								log('charts',`[${performance.now().toFixed(0)}ms] SVG loaded: ${newObj.getAttribute('data')}`);
								if (typeof applyTranslation === "function") applyTranslation(currentLang);
								attachChartButtons(div, newObj); // This calls decrementLoader()
								newObj.onload = null; 
							};
							wrapper.appendChild(newObj);
						} 
						else {
							// Chart is already correct, just count it as "done"
							decrementLoader();
						}
					} else {
						// Country is hidden, clear it and count it as "done"
						div.style.display = 'none';
						wrapper.innerHTML = '';
						decrementLoader();
					}
				});
				
				// Update the counter text in the label
				document.getElementById("selectedCount").textContent = selectedOptions.includes('all') ? totalCount : selectedOptions.length;

			}, 10); // Small delay for iPad/Mobile stability
		}
	});
	tsInstances.push(countryControl);
}


// Used to fetch JSON data from embedded script element while testing offline
function fakeFetch() {
	return new Promise((resolve) => {
		// Simulate fetching JSON data (from the script tag in this case)
		const jsonData = JSON.parse(document.getElementById('json-data').textContent);
		resolve(jsonData); // Resolve the promise with the JSON data
	});
}
		
function makeCountryDiv(entry) {
	const countryName = entry.country;
	const countryId = countryName.toLowerCase().replace(/\s+/g, '');  // Lowercase and remove spaces

	// Generate paths for SVG and CSV
	const svgPath = `img/${countryId}_${DATASET}_monthly.svg`;
	const csvPath = `data/${countryId}_${DATASET}_monthly.csv`;

	// Create country graph container
	const countryDiv = document.createElement('div');
	countryDiv.className = 'pure-u-1 pure-u-md-1-2 pure-u-lg-1-3 country figure-group';
	countryDiv.setAttribute('data-country', countryName);

	// Add country title
	countryDiv.innerHTML += `<div class="countrytitle">${countryName}</div>`;

	// Build the details section dynamically
	let detailsHtml = '<div class="details">';
	if (entry.dedicatedPage) {
	  detailsHtml += `<a href="${entry.dedicatedPage}">Dedicated page</a> | `;
	}
	if (entry.sources) {
	  detailsHtml += `Data: `;
	  entry.sources.forEach((source, index) => {
		detailsHtml += `<a href="${source.url}">${source.name}</a>`;
		if (source.geofenced) {
		  detailsHtml += ' (geofenced)';
		}
		if (index < entry.sources.length - 1) {
		  detailsHtml += ' ';
		}
	  });

	}
	detailsHtml += '</div>';
	countryDiv.innerHTML += detailsHtml;

	// Embed the SVG graph
	countryDiv.innerHTML += `<div class="chart-wrapper"></div>`;
		
	return countryDiv;
}

function populateCountries() {
  fetch(`https://robbieandrew.github.io/${DATASET}/data.json`)
    .then(response => response.json())
    .then(data => {
        const graphContainer = document.querySelector('.pure-g');

        // 1. Sort countries by name
        data.sort((a, b) => a.country.localeCompare(b.country));

        data.forEach(entry => {
            // Append the empty containers to the page
            graphContainer.appendChild(makeCountryDiv(entry));
        });

        // 3. Initialize the selector
        makeCountrySelector();
		
        // 4. Signal that the DOM is ready for the second script
        window.dispatchEvent(new Event('countriesPopulated'));
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
        hidePageLoader(); // Hide spinner if the initial data fetch fails
    });
}

function attachChartButtons(container, svgObject) {
	const svgTitle = (svgObject.contentDocument?.querySelector('title')?.textContent.trim() ?? svgObject.getAttribute('data'))
    .replace(/[^a-zA-Z0-9_-]/g, '_');
	log('charts',`[${performance.now().toFixed(0)}ms] onload fired for: ${svgTitle}`);
	
    // 1. If buttons already exist, we still need to decrement the counter
    if (container.querySelector('.svg-button-group')) {
        decrementLoader();
        return; 
    }

    // 2. Add the standard buttons (PNG/Clipboard)
    if (typeof addSVGbuttons === "function") {
        console.time(`addSVGbuttons-${svgTitle}`);
        addSVGbuttons(svgObject);
        console.timeEnd(`addSVGbuttons-${svgTitle}`);
    }

    // 3. Add the "Download Data" button
    let buttonGroup = container.querySelector('.svg-button-group');
    if (buttonGroup) {
        const countryId = container.dataset.country.toLowerCase().replace(/\s+/g, '');
        const activeFreq = document.getElementById('frequencySelector').value;
        const csvPath = `data/${countryId}_${DATASET}_${activeFreq}.csv`;
        
        const dataBtn = document.createElement('a');
        dataBtn.href = csvPath;
        dataBtn.className = 'simple-button';
        dataBtn.setAttribute('download', '');
        dataBtn.textContent = 'Download data';
        buttonGroup.appendChild(dataBtn);
    }

    // 4. Always decrement at the end of a successful attachment
    decrementLoader();
}

// Helper function to handle the countdown safely
function decrementLoader() {
	if (typeof window.svgsToLoad === 'undefined') log('spinner','window.svgsToLoad is undefined!');
	if (typeof window.svgsToLoad !== 'undefined' && window.svgsToLoad == 0) log('spinner','window.svgsToLoad is zero!');
    if (typeof window.svgsToLoad !== 'undefined' && window.svgsToLoad > 0) {
        window.svgsToLoad--;
        log('spinner',`Charts remaining: ${window.svgsToLoad}`);
		if (window.svgsToLoad === 0) {
            hidePageLoader();
        }
    } else {
        // If it's already 0, ensure the loader is hidden
		log('spinner','svgsToLoad is zero: hiding the spinner')
        hidePageLoader();
    }
}

// Helper functions for the spinner
function showPageLoader() {
    const loader = document.getElementById('page-loader');
    const controls = document.querySelector('.selector-container');

	// Disable all TomSelect instances
    tsInstances.forEach(ts => ts.disable());
	
    if (loader && controls) {
		log('spinner','Showing the loading spinner')
		// 1. Lock the UI
        document.body.classList.add('loading-active');
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }

        // 2. Get the current position of the selectors
        const rect = controls.getBoundingClientRect();
        
        // 3. Horizontal: Always exactly 50% of the viewport width
        loader.style.left = '50%';
        
        // 4. Vertical: Center of the selector container
        // rect.top is relative to the viewport, which works perfectly with fixed positioning
        const targetTop = rect.top + (rect.height / 2);
        loader.style.top = `${targetTop}px`;
        
        // 5. Transform ensures the center of the SPINNER sits on that (50%, targetTop) point
        loader.style.transform = 'translate(-50%, -50%)';
        
        // 6. Reveal
        loader.style.display = 'flex';
        void loader.offsetWidth; // Force reflow
        loader.style.opacity = '1';
    }
}

function hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        if (loaderSafetyTimeout) {
			clearTimeout(loaderSafetyTimeout);
		}
        loader.style.opacity = '0';
        setTimeout(() => {
			loader.style.display = 'none';
			// 1. Release the browser-level click shield
            document.body.classList.remove('loading-active');
            // 2. Enable all selectors
            tsInstances.forEach(ts => ts.enable());
		}, 500);
		isInitialSetup = false;
    }
}
function triggerMassLoad(count) {
    log('spinner',"Triggering mass load for " + count + " items.");
    window.svgsToLoad = count; // global scope
	log('spinner',`triggerMassLoad: svgsToLoad is now ${window.svgsToLoad}`)
    if (count > 0) {
		showPageLoader();
	} else {
        hidePageLoader();
    }
}

function sortCountries(method) {
  const graphContainer = document.querySelector('.pure-g');
  const countryDivs = Array.from(graphContainer.children);

  // 1. Sort the array of elements in memory
  countryDivs.sort((a, b) => {
	const countryA = a.getAttribute('data-country');
	const countryB = b.getAttribute('data-country');
	
    if (method === 'bev-share') {
      // Sort descending (highest share first)
      return (bevShareData[countryB] || 0) - (bevShareData[countryA] || 0);
    } else if (method === 'last-updated') {
      const tsA = (window.lastUpdatedData && window.lastUpdatedData[countryA]) || 0;
	  console.log(`Looking up "${countryA}": ${tsA}`);
      const tsB = (window.lastUpdatedData && window.lastUpdatedData[countryB]) || 0;
      return tsB - tsA; // Most recently updated first
    } else {
      // Sort ascending (A-Z)
      return countryA.localeCompare(countryB);
    }
  });

  // 2. Apply a CSS 'order' value to each div based on its new position
  // This moves them visually without "re-inserting" them into the DOM
  countryDivs.forEach((div, index) => {
    div.style.order = index;
  });
  
  console.log('Sort applied:', countryDivs.map(d => `${d.getAttribute('data-country')}: order ${d.style.order}`));
}

let bevShareData = {};

// Fetch BEV share data
fetch(`https://robbieandrew.github.io/${DATASET}/data/latest_bev_share.json`)
  .then(response => response.json())
  .then(data => {
    bevShareData = data.reduce((acc, item) => {
      acc[item.country] = item.BEVshare;
      return acc;
    }, {});
  })
  .catch(error => console.error('Error loading BEV share data:', error));

function setupLanguagePersistence() {
    const langSelect = document.getElementById('langSelector');
    
    // 1. On page load: Check URL for ?lang=XX
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang) {
        langSelect.value = urlLang;
        applyTranslation(urlLang);
    }

    // 2. On change: Update URL and translate
    langSelect.addEventListener('change', function() {
        const newLang = this.value;
        
        // Update URL without reloading page
        const url = new URL(window.location);
        url.searchParams.set('lang', newLang);
        window.history.pushState({}, '', url);
        
        applyTranslation(newLang);
    });
}

window.addEventListener('resize', () => {
    const loader = document.getElementById('page-loader');
    // Only update if the loader is currently visible
    if (loader && loader.style.opacity === '1') {
        showPageLoader();
    }
});
// Fetch JSON and generate HTML dynamically
window.onload = function() {
	populateCountries();
    setupLanguagePersistence();
};

window.addEventListener('countriesPopulated', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
	function sanitizeUrlArg(value, validOptions, fallback) {
		return validOptions.includes(value) ? value : fallback;
	}

	const urlArgs = {
		lang: sanitizeUrlArg(urlParams.get('lang'), ['da','de','en','es','fi','fr','it','ja','ko','no','pl','sv','zh'], 'en'),
		freq: sanitizeUrlArg(urlParams.get('freq'), ['monthly','quarterly','half-yearly','annual'], 'monthly'),
		type: sanitizeUrlArg(urlParams.get('type'), ['relative','absolute','line'], 'relative'),
		sort: sanitizeUrlArg(urlParams.get('sort'), ['alphabetical','bev-share','last-updated'], 'alphabetical'),
	};

    const updateURL = (key, value) => {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    };

    // Mapping of selector IDs to their URL parameter keys
    const selectorConfig = {
        '#langSelector': 'lang',
        '#frequencySelector': 'freq',
        '#formatSelector': 'type',
        '#sortSelector': 'sort'
    };

    Object.keys(selectorConfig).forEach(id => {
        const key = selectorConfig[id];
        const el = document.querySelector(id);
        
        if (el) {
            // Initialize TomSelect
            const ts = new TomSelect(id, {
                create: false,
                hideSelected: false,
                controlInput: null,
                onChange: function(value) {
                    updateURL(key, value);
                    // Trigger the specific UI updates
                    if (id === '#langSelector') applyTranslation(value);
                    if (id === '#frequencySelector' || id === '#formatSelector') updateCharts();
                    if (id === '#sortSelector') sortCountries(value);
					if (!isTouchDevice) {
						this.blur();
					}
                }
            });
            // Set initial value from URL
            ts.setValue(urlArgs[key]);
			tsInstances.push(ts);
        }
    });

	// Final sorting based on initial URL state
	if (urlArgs.sort === 'last-updated') {
		if (window.lastUpdatedData) {
			sortCountries(urlArgs.sort);
		} else {
			window.addEventListener('updatesLoaded', function() {
				console.log('updatesLoaded fired, sorting now');
				sortCountries(urlArgs.sort);
			});
		}
	} else {
		sortCountries(urlArgs.sort);
	}
	// This ensures that all initial "onChange" triggers from 
    // ALL selectors have finished before we allow the loader to be dismissed.
    setTimeout(() => {
        isInitialSetup = false;
    }, 1000);
});

