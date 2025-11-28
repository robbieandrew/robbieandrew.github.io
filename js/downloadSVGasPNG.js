/* */

function renderSVGtoPNGBlob(svgObject, callback) {
  try {
    const svg = svgObject.contentDocument.querySelector('svg');

    // Make a copy (clone) of the SVG object so we can manipulate it
    const clonedSvg = svg.cloneNode(true);

    // Remove any foreignObject elements from the clone. These are seen by the browser as cross-origin, and cause conversion (toBlob) to fail.
    clonedSvg.querySelectorAll('foreignObject').forEach(fo => fo.remove());

    // Create a canvas element (bitmap)
    const canvas = document.createElement('canvas');
  // To improve antialiasing in the final render, first convert to raster at double the desired resolution before later scaling down again
    const scale = 2;
    canvas.width = 1852 * scale;
    // Maintain aspect ratio
    const svgRect = svg.getBoundingClientRect();
    canvas.height = Math.round(svgRect.height / svgRect.width * canvas.width);

    const ctx = canvas.getContext('2d');

    // Convert SVG to a data URL
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const DOMURL = window.URL || window.webkitURL || window;
    const svgUrl = DOMURL.createObjectURL(svgBlob);

    // Create a bitmap from the SVG
    const img = new Image();
    img.onload = function () {
    // First draw a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Then draw the image on the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      DOMURL.revokeObjectURL(svgUrl);
      // Create a smaller canvas for the final output
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width / scale;
      finalCanvas.height = canvas.height / scale;
      const finalCtx = finalCanvas.getContext('2d');
    // Draw the high-resolution canvas onto the smaller canvas
      finalCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height,
                         0, 0, finalCanvas.width, finalCanvas.height);

      finalCanvas.toBlob(blob => {
        callback(blob);
      }, 'image/png');
    };
    img.src = svgUrl;

  } catch (error) {
    console.warn("Error rendering SVG to PNG", error);
  }
}

function renderIMGtoPNGBlob(imgElement, callback) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'Anonymous'; // Crucial for loading external images securely

  img.onload = () => {
    try {
      // Set canvas dimensions based on the loaded image/element size
      canvas.width = img.naturalWidth || imgElement.width || 300;
      canvas.height = img.naturalHeight || imgElement.height || 150;
      // Draw image to canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Convert canvas to PNG Blob and call the user's callback
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas to Blob conversion failed for IMG.');
        }
        callback(blob); 
      }, 'image/png');
    } catch (e) {
      console.error('Error drawing IMG to canvas:', e);
      callback(null);
    }
  };
  img.onerror = (e) => {
    console.error('IMG loading failed (CORS or invalid source):', e);
    callback(null);
  };
  img.src = imgElement.src;
}

function copySVGasPNG(svgObject, anchorElement) {
  if (!navigator.clipboard || !window.ClipboardItem) {
  showToastBelowElement(anchorElement, 'Clipboard API not supported by your browser.');
  return;
  }

  renderSVGtoPNGBlob(svgObject, async (blob) => {
  if (!blob) {
    showToastBelowElement(anchorElement, 'Failed to process image data.');
    return;
  }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToastBelowElement(anchorElement,'Copied to clipboard as PNG!');
    } catch (err) {
      console.error('Clipboard write failed', err);
      showToastBelowElement(anchorElement,'Failed to copy image to clipboard.');
    }
  });
}

function copyElementAsPNG(element, anchorElement) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    showToastBelowElement(anchorElement, 'Clipboard API not supported by your browser.');
    return;
  }
  const tagName = element.tagName.toUpperCase();
  let renderFunction;

  if (tagName === 'IMG') {
    renderFunction = renderIMGtoPNGBlob;
  } else if (tagName === 'OBJECT') {
    renderFunction = renderSVGtoPNGBlob;
  } else {
    showToastBelowElement(anchorElement, `Unsupported element type: ${tagName}.`);
    console.error('Unsupported element type for PNG conversion:', tagName);
    return;
  }
  renderFunction(element, async (blob) => {
    if (!blob) {
      showToastBelowElement(anchorElement, 'Failed to process image data.');
      return;
    }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToastBelowElement(anchorElement, 'Copied to clipboard as PNG!');
    } catch (err) {
      console.error('Clipboard write failed', err);
      showToastBelowElement(anchorElement, 'Failed to copy image to clipboard.');
    }
  });
}


function downloadSVGasPNG(svgObject) {
  renderSVGtoPNGBlob(svgObject, (blob) => {
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${svgObject.getAttribute('data').split('/').pop().replace('.svg', '')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    DOMURL.revokeObjectURL(url);
  });
}

/* downloadSVGasPDF
   Convert the SVG to PDF format for download. Various very specific handling of the SVG file format output by gcpSaveSVG.m */
function downloadSVGasPDF(svgObject) {
  try {
    const { jsPDF } = window.jspdf;
    const svg = svgObject.contentDocument.querySelector('svg');

    // Clone so we can safely manipulate
    const clonedSvg = svg.cloneNode(true);
    const defs = clonedSvg.querySelector('defs');
  
    // --- UTILITY FUNCTION: Extract CSS Property from Style Block ---
    // This is necessary because getComputedStyle() doesn't work reliably on detached clones.
    function getStyleProperty(selector, propertyName) {
        const styleBlock = clonedSvg.querySelector('style')?.textContent;
        if (!styleBlock) return null;

        // Simple regex to find the rule for the selector
        const ruleMatch = styleBlock.match(new RegExp(`\\s*${selector}\\s*\\{([^}]+)\\}`, 'i'));
        if (!ruleMatch || !ruleMatch[1]) return null;

        const declarationBlock = ruleMatch[1];
        
        // Regex to find the property within the rule
        const propMatch = declarationBlock.match(new RegExp(`\\s*${propertyName}\\s*:\\s*([^;\\s]+)[;\\s]`, 'i'));
        
        // Return the captured value if found
        return propMatch ? propMatch[1].trim() : null;
    }
    
    // --- 1. Targeted Removal (Clean-up) ---
    // These things are normally invisible anyway, and some appear to confuse svg2pdf
    clonedSvg.querySelectorAll('foreignObject, .marker, .dl_el, .twitlink').forEach(el => el.remove());

    // --- 2. Fix polylines ---
    // The issue is that polylines are implemented in the defs section and then used later, and svg2pdf isn't handling that well. So here we simply make them normal polylines.
    const lineUseElements = clonedSvg.querySelectorAll('use.pll'); 
    lineUseElements.forEach(useEl => {
		const href = useEl.getAttribute('xlink:href') || useEl.getAttribute('href');
		if (href && defs) {
			const symbolId = href.substring(1); 
			const symbol = defs.querySelector(`#${symbolId}`);
			
			if (symbol) {
				const polylineTemplates = symbol.querySelectorAll('polyline'); // Use querySelectorAll
				
				if (polylineTemplates.length > 0) {
					// Get attributes from the <use> element
					const strokeColor = useEl.getAttribute('stroke');
					const strokeWidth = useEl.getAttribute('stroke-width') || '0.90';
					const parent = useEl.parentNode;
					
					// Track the *last* polyline inserted so we can insert the next one after it.
					let lastInsertedNode = useEl; // Start by referencing the <use> element itself
					
					polylineTemplates.forEach(polylineTemplate => {
						const newPolyline = polylineTemplate.cloneNode(true);
						
						if (strokeColor) {
							newPolyline.setAttribute('stroke', strokeColor);
						}
						newPolyline.setAttribute('stroke-width', strokeWidth);
						newPolyline.setAttribute('fill', 'none');
						newPolyline.setAttribute('opacity', '1');
						
						// The core fix: Insert *after* the previous node (or replace the first node)
						if (lastInsertedNode === useEl) {
							// This is the first polyline: Replace the original <use> element.
							parent.replaceChild(newPolyline, useEl);
						} else {
							// This is a subsequent polyline: Insert it *after* the one we just inserted.
							// We achieve 'insert after' by inserting *before* the next sibling of the reference node.
							parent.insertBefore(newPolyline, lastInsertedNode.nextSibling); 
						}
						
						// Crucial update: Set the newly inserted polyline as the reference for the next iteration.
						lastInsertedNode = newPolyline; 
					});
				}
			}
		}
	});

    // APPLY STYLES DIRECTLY TO TEXT ELEMENTS
    // svg2pdf isn't always using the styling correctly, so apply directly to each element
    // Get the primary font-family from the #main block (Helvetica,Arial,sans-serif)
    const mainFontFamily = getStyleProperty('#main', 'font-family') || 'Helvetica, Arial, sans-serif';
    const tickLabelFill = getStyleProperty('.ticklabel', 'fill');

    // Y-axis Labels (class="ticklabel") and the Footer Text
    clonedSvg.querySelectorAll('text.ticklabel, text:not([class])').forEach(textEl => {
        // Construct the style string for maximum specificity
        let style = `font-family:${mainFontFamily};`;
        if (textEl.classList.contains('ticklabel') && tickLabelFill) {
            style += ` fill:${tickLabelFill};`;
        }
        
        // Apply to style attribute, overriding any CSS or conversion default
        textEl.setAttribute('style', style); 
    });
    // b) X-axis/Legend Labels (text class="pl")
    clonedSvg.querySelectorAll('text.pl').forEach(textEl => {
        // Force font and opacity to ensure they are rendered correctly by svg2pdf
        textEl.setAttribute('font-family', mainFontFamily);
        textEl.setAttribute('opacity', '1'); 
    });

    // SPECIFIC FIXES TO SOME TEXT ELEMENTS
    clonedSvg.querySelectorAll('text').forEach(textEl => {
        let textContent = textEl.innerHTML;
    // The tspans used for the subscript-2 are upsetting svg2pdf. I tried a bunch of different solutions, but none worked. So here just replace with a normal CO2.
    const complexCO2Pattern = /(CO)(<tspan[^>]*dy="0\.2em"[^>]*><tspan[^>]*style="font-size:70%"[^>]*>2<\/tspan><\/tspan><tspan[^>]*dy="-0\.2em"[^>]*> <\/tspan>)/gi;
        if (complexCO2Pattern.test(textContent)) {
            // Replace with a simplified structure: CO + TSPAN using baseline-shift="sub"
            // This is the cleanest SVG way to achieve subscript without relying on complex dy logic.
            textContent = textContent.replace(complexCO2Pattern, 'CO2 '); 
        }
        // Footer sanitization (Only applies to elements that originally contained <a> tags)
        if (textEl.querySelector('a')) {
            // Strip the <a> tags
            textContent = textContent.replace(/<a[^>]*>(.*?)<\/a>/gi, (match, p1) => p1);
        }
    // Replace the bullet character (● or &#9679;). I think the problem is that svg2pdf isn't handling encoded characters like &#9679; or /u2022, and just having the character directly fixes it.
    textContent = textContent.replace(/●|&#9679;/g, '•'); 
    
        textEl.innerHTML = textContent;
    });

    // HORIZONTAL GRID-LINES ARE TOO LIGHT. No idea why, but the fix is just to replace the colour and remove the opacity style. This is hard-wired to the specific grey I use for grid lines.
    if (defs) {
        // Find all grid line paths using a comma-separated selector
        const gridLines = defs.querySelectorAll('path#line_x, path#line_y'); 
        
        // Iterate over the resulting list and apply the fix to each one
        gridLines.forEach(gridLine => {
            // Force stroke color to a light grey that visually matches 15% opacity on a dark line
            gridLine.setAttribute('stroke', '#DEDEDE'); 
            // Remove the problematic opacity attribute
            gridLine.removeAttribute('stroke-opacity');
        });
    } 

/*  // Save the modified internal SVG to a file for debugging
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'debug_modified.svg'; // The file name to save as
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Release the temporary URL
    URL.revokeObjectURL(svgUrl); 
*/

    // Determine dimensions from viewBox or width/height attributes
    let width, height;
    if (svg.hasAttribute("viewBox")) {
      const viewBox = svg.getAttribute("viewBox").split(/\s+|,/).map(Number);
      width = viewBox[2];
      height = viewBox[3];
    } else if (svg.hasAttribute("width") && svg.hasAttribute("height")) {
      width = parseFloat(svg.getAttribute("width"));
      height = parseFloat(svg.getAttribute("height"));
    } else {
      const rect = svg.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }

    // Create PDF with same size as SVG
    const pdf = new jsPDF({
      orientation: width > height ? 'l' : 'p',
      unit: 'pt',
      format: [width, height]
    });

    pdf.svg(clonedSvg, {
      x: 0,
      y: 0,
      width: width,
      height: height
    })
    .then(() => {
        // Save must be inside the .then() block because conversion is asynchronous
        const filename = (svgObject.getAttribute('data') || 'output.svg').split('/').pop().replace('.svg', '');
        pdf.save(filename + '.pdf');
    })
    .catch(error => {
        console.warn("Error during SVG to PDF conversion (pdf.svg()):", error);
    });

  } catch (error) {
    console.warn("Error exporting SVG to vector PDF", error);
  }
}



function isIOSorIPadOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && 'ontouchend' in document)
  );
}

function showToastBelowElement(anchorElement, message, duration = 2000) {
  const rect = anchorElement.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  const toast = document.createElement('div');
  toast.classList.add('toast-message');
  toast.textContent = message;

  const anchorCenter = rect.left + scrollLeft + (rect.width / 2);
  toast.style.left = `${anchorCenter}px`;
  toast.style.top = `${rect.bottom + scrollTop + 4}px`; // 4px spacing below the element

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}

function createPNGDownloadLink(svgObject) {
  const downloadLink = document.createElement('a');
  downloadLink.href = '#';
  downloadLink.textContent = 'Download as PNG';
  downloadLink.className = 'simple-button';
  downloadLink.addEventListener('click', (e) => {
    e.preventDefault(); // prevent browser trying to navigate to https://.../#
    downloadSVGasPNG(svgObject);
  });
  return downloadLink;
}

function createIMGDownloadLink(imgelement) {
  // Ensure the argument is a valid element object before proceeding
  if (!imgelement || !imgelement.tagName) {
    return null;
  }
  
  if (imgelement.tagName.toUpperCase() !== 'IMG') {
    return null;
  }

  const downloadLink = document.createElement('a');
  downloadLink.href = '#';
  downloadLink.className = 'simple-button';

    try {
      const sourceUrl = imgelement.src;
      let fileExtension = 'FILE';
      let suggestedFilename = 'image'; 

	  const filenameMatch = sourceUrl.match(/([^/\\&\?]+)(\?.*)?$/i);
      
      if (filenameMatch) {
        suggestedFilename = filenameMatch[1]; 
        
        // Look for the last dot in the captured filename
        const extMatch = suggestedFilename.match(/\.([a-z0-9]+)$/i); 
        
        if (extMatch) {
          fileExtension = extMatch[1].toUpperCase(); // E.g., "PNG"
        } else {
          // If a dot followed by characters wasn't found, keep the 'FILE' fallback
          // This ensures the link text is accurate.
        }
      } else {
        // Fallback if the URL structure is too complex
        suggestedFilename = 'image.file';
      }

      // Configure the download link
      downloadLink.textContent = `Download as ${fileExtension}`;
      downloadLink.href = sourceUrl;
      downloadLink.download = suggestedFilename; 

    } catch (e) {
      console.error("Error processing IMG element for download link:", e);
    }

  return downloadLink;
}

function createPDFDownloadLink(element) {
  const tagName = element.tagName.toUpperCase();

  if (tagName === 'OBJECT') {
    if (typeof window.jspdf === 'undefined') {
      // Return null if jspdf is not available
      return null;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = '#';
    downloadLink.textContent = 'Download as PDF';
    downloadLink.className = 'simple-button';
    downloadLink.addEventListener('click', (e) => {
      e.preventDefault(); // prevent browser trying to navigate to https://.../#
      downloadSVGasPDF(element);
    });
    return downloadLink;
  } else if (tagName === 'IMG') {
	// One day I'll finish this. I want to check whether a file exists under pdf/ with the same name as the image file under img/. Requires fetch, cache, etc.
    console.warn(`Unsupported element type in createPDFDownloadLink: ${tagName}`);
    return null; 
  } else {
    console.warn(`Unsupported element type in createPDFDownloadLink: ${tagName}`);
    return null; 
  }
}

/* Return a link element that will open the object/img in a new tab and that can be added to the page */
function createEnlargeLink(element) {
  // 1. Create the link element
  const enlargeLink = document.createElement('a');
  enlargeLink.href = '#';
  enlargeLink.textContent = 'Enlarge this figure';
  enlargeLink.className = 'simple-button';

  // 2. Add the click handler
  enlargeLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Read the current URL on click
    let imageURL;
    const tagName = element.tagName.toUpperCase();

    if (tagName === 'OBJECT') {
      imageURL = element.data;
    } else if (tagName === 'IMG') {
      imageURL = element.src;
    } 

    if (imageURL) {
      window.open(imageURL, '_blank');
    } else {
      console.warn(`${tagName} element has no URL to open.`);
    }
  });

  return enlargeLink;
}
/* Backed up the previous version of the function 28 November 2025.
   Delete this if everything is still working next time I see this! */
/*function createEnlargeLink(element) {
  // 1. Determine the URL based on the element type
  let imageURL;
  const tagName = element.tagName.toUpperCase();

  if (tagName === 'OBJECT') {
    // For SVG loaded as an <object>, the URL is in the 'data' attribute.
    imageURL = element.data;
  } else if (tagName === 'IMG') {
    // For <img> elements, the URL is in the 'src' attribute.
    imageURL = element.src;
  } else {
    // Log a warning if it's an unsupported element type and return null or throw.
    console.warn(`Unsupported element type for enlargement link: ${tagName}`);
    return null; 
  }

  // If no URL is found, we also stop here.
  if (!imageURL) {
    console.warn(`${tagName} element has no URL to open.`);
    return null;
  }

  // 2. Create the link element
  const enlargeLink = document.createElement('a');
  enlargeLink.href = '#'; // Use '#' as a placeholder, as the navigation is handled by JS
  enlargeLink.textContent = 'Enlarge this figure';
  enlargeLink.className = 'simple-button';

  // 3. Add the click handler
  enlargeLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(imageURL, '_blank');
  });

  return enlargeLink;
}*/

/*function createEnlargeLink(svgObject) {
  const enlargeLink = document.createElement('a');
  const imageURL = svgObject.data;
  enlargeLink.href = '#' ;
  enlargeLink.textContent = 'Enlarge this figure';
  enlargeLink.className = 'simple-button';
  enlargeLink.addEventListener('click', (e) => {
    e.preventDefault();
    const currentURL = svgObject.data;

    if (currentURL) {
      window.open(currentURL, '_blank');
    } else {
      console.warn('SVG object has no data URL to open.');
    }
  });
  return enlargeLink;
}*/

function createCopyLink(element) {
  const copyLink = document.createElement('a');
  copyLink.href = '#';
  copyLink.textContent = 'Copy to clipboard';
  copyLink.className = 'simple-button';
  copyLink.addEventListener('click', (e) => {
    e.preventDefault();
    copyElementAsPNG(element, copyLink);
  });
  return copyLink;
}


function createAltTextLink(svgObject) {
  const altLink = document.createElement('a');

  altLink.href = '#';
  altLink.textContent = 'Alt';
  altLink.className = 'simple-button';
  altLink.addEventListener('click', (e) => {
    e.preventDefault();
    const svgDoc = svgObject.contentDocument;
    if (!svgDoc) {
	  console.error("SVG document missing!");
	  return null;
	}
    const titleEl = svgDoc.querySelector("title");
    if (!titleEl) {
      const svgURL = svgObject.data;
      console.error("SVG object has no 'title' element: ",svgURL.split('/').pop());
      return null;
    }
    const titleText = titleEl.textContent.trim() || "Untitled graph";
    const altText = `Graph showing: ${titleText}`;

    navigator.clipboard.writeText(altText)
      .then(() => {
    showToastBelowElement(altLink,'Copied simple alt text to clipboard!');
        console.log("Copied to clipboard:", altText);
      })
      .catch(err => {
        showToastBelowElement(altLink,'Failed to copy alt text to clipboard.');
        console.error("Failed to copy:", err);
      });
  });
  return altLink;
}

/* Backed up the previous version of the function 28 November 2025.
   Delete this if everything is still working next time I see this! */
/*function createAltTextLink(svgObject) {
  const altLink = document.createElement('a');
  const svgDoc = svgObject.contentDocument;
  const svgURL = svgObject.data;

  if (!svgDoc) return null;
  const titleEl = svgDoc.querySelector("title");
  if (!titleEl) {
    console.error("SVG object has no 'title' element: ",svgURL.split('/').pop());
    return null;
  }
  altLink.href = '#';
  altLink.textContent = 'Alt';
  altLink.className = 'simple-button';
  altLink.addEventListener('click', (e) => {
    e.preventDefault();
    const titleText = titleEl.textContent.trim() || "Untitled graph";
    const altText = `Graph showing: ${titleText}`;

    navigator.clipboard.writeText(altText)
      .then(() => {
    showToastBelowElement(altLink,'Copied simple alt text to clipboard!');
        console.log("Copied to clipboard:", altText);
      })
      .catch(err => {
        showToastBelowElement(altLink,'Failed to copy alt text to clipboard.');
        console.error("Failed to copy:", err);
      });
  });
  return altLink;
}*/

// Only implemented for country/index.html
function createDataDownloadLink(svgObject) {
  const svgURL = svgObject.data;
  if (!svgURL) {
    console.log("SVG object has no data URL.");
    return null;
  }

  const urlParts = svgURL.split('/');

  const imgIndex = urlParts.indexOf('img');
  if (imgIndex === -1 || imgIndex + 1 >= urlParts.length) {
    console.log("URL does not contain the correct '/img/' path or isoCode is missing.");
    return null;
  }

  // if the svg file is located at, e.g. img/POL/POL_monthlyCO2.svg, then extract 'POL/' as the isoCode
  let isoCode ;
  if (urlParts.length-imgIndex === 3) {
    isoCode = urlParts[imgIndex + 1] + "/" ; // The element immediately following 'img' is the isoCode
  }
  else {
  isoCode = "" ;
  }
  
  if (typeof availableDataFiles === 'undefined' || !Array.isArray(availableDataFiles)) {
    // No data file list available. Skipping data link.
    return null;
  }

  const baseName = svgURL.split('/').pop().replace('.svg', '');
  const candidateFilenames = [`${baseName}.csv`, `${baseName}_data.csv`];

  if (availableDataFiles.length === 0) {
    console.log("createDataDownloadLink: availableDataFiles is empty!");
  return null;
  }
  
  for (const name of candidateFilenames) {
    if (availableDataFiles.includes(name)) {
      const dataFilePath = `data/${isoCode}${name}`;
      console.log(`Data file found: ${dataFilePath}`);

      const link = document.createElement('a');
      link.href = "#";
    link.className = 'simple-button';
      link.textContent = 'Download data';
      link.addEventListener('click', (event) => {
        event.preventDefault();

        const hiddenLink = document.createElement('a');
        hiddenLink.href = dataFilePath;
        hiddenLink.download = name;
        document.body.appendChild(hiddenLink);
        hiddenLink.click();
        document.body.removeChild(hiddenLink);
      });

      return link;
    }
  }

//  console.log(`No matching data file found for: ${baseName}`);
  return null;
}

function addSVGbuttons(svgObject) {
  const container = svgObject.parentNode;
  let linkContainer = container.querySelector('.svg-button-group');
  
  if (!linkContainer || !linkContainer.matches('p') || !linkContainer.classList.contains('svg-button-group')) {
    // If it doesn't exist, create a new one
    linkContainer = document.createElement('p');
    linkContainer.classList.add("svg-button-group");
    container.insertBefore(linkContainer, svgObject.nextSibling);
  }

  // --- 1. Create All Potential Links ---
  const downloadPNGLink = createPNGDownloadLink(svgObject);
  const downloadPDFLink = createPDFDownloadLink(svgObject);
  const dataLink = createDataDownloadLink(svgObject);
  const enlargeLink = createEnlargeLink(svgObject);
  const alttextLink = createAltTextLink(svgObject);
  const copyLink = !isIOSorIPadOS() ? createCopyLink(svgObject) : null;

  // --- 2. Separate into Link Groups ---
  const downloadButtons = [];
  if (downloadPNGLink) downloadButtons.push(downloadPNGLink);
  if (downloadPDFLink) downloadButtons.push(downloadPDFLink);
  if (dataLink) downloadButtons.push(dataLink); // Data is a form of download

  const allButtons = [enlargeLink, copyLink, alttextLink];
  
  // --- 3. Check Existing Links (To avoid duplicates and handle replacement) ---
  const existingLinksText = Array.from(linkContainer.querySelectorAll('a')).map(a => a.textContent.trim());

  // Function to check if a link based on its text already exists
  const isExisting = (text) => existingLinksText.includes(text);

  // --- 4. Render Buttons ---
  // Download links: Consolidate if count >= THRESHOLD
  const downloadOptionCount = downloadButtons.length;
  const THRESHOLD = 300; 
  let hasDownloadGroup = existingLinksText.includes('Downloads...'); 
  
  // Clean up any existing individual download links if a group is being created
  if (downloadOptionCount >= THRESHOLD || hasDownloadGroup) {
      ['Download as PNG', 'Download as PDF', 'Download data', 'View as PNG']
        .forEach(text => {
          const existing = Array.from(linkContainer.querySelectorAll('a')).find(a => a.textContent.trim() === text);
          if (existing) existing.remove();
        });
  }

  if (downloadOptionCount >= THRESHOLD) {
    const dropdownWrapper = createDropdownButton(svgObject, downloadButtons);
    if (!hasDownloadGroup) {
        linkContainer.appendChild(dropdownWrapper);
    } else {
        // If a dropdown already exists, we should probably replace it, 
        // but for simplicity here we just ensure the new one is added 
        // and rely on the cleanup above to remove the old *individual* links.
        // A more robust solution might find and replace the existing .dropdown-wrapper.
    }

  } else {
    // Render individually if 2 or fewer download options
    for (const link of downloadButtons) {
      if (link && !isExisting(link.textContent.trim())) {
        linkContainer.appendChild(link);
      }
    }
  }

  // Non-download links (Always rendered individually)
  for (const link of allButtons) {
    if (link && !isExisting(link.textContent.trim())) {
      // Handle the 'View as PNG' replacement case for the PNG link only
      if (link.textContent.trim() === 'Download as PNG' && existingLinksText.includes('View as PNG')) {
        const viewLink = Array.from(linkContainer.querySelectorAll('a')).find(a => a.textContent.trim() === 'View as PNG');
        if (viewLink) linkContainer.replaceChild(link, viewLink);
      } else {
        linkContainer.appendChild(link);
      }
    }
  }

  // A small cleanup to remove the 'Download...' button if the options drop below the threshold
  if (downloadOptionCount < THRESHOLD && hasDownloadGroup) {
    const existingDropdown = linkContainer.querySelector('.dropdown-wrapper');
    if (existingDropdown) existingDropdown.remove();
  }
}

function addIMGbuttons(imgElement) {
  const container = imgElement.parentNode;
  let linkContainer = container.querySelector('.img-button-group');
  
  if (!linkContainer || !linkContainer.matches('p') || !linkContainer.classList.contains('img-button-group')) {
    // If it doesn't exist, create a new one
    linkContainer = document.createElement('p');
    linkContainer.classList.add("img-button-group");
    container.insertBefore(linkContainer, imgElement.nextSibling);
  }

  // --- 1. Create All Potential Links ---
  const downloadIMGLink = createIMGDownloadLink(imgElement);
//  const downloadPDFLink = createPDFDownloadLink(imgElement);
//  const dataLink = createDataDownloadLink(imgElement);
  const enlargeLink = createEnlargeLink(imgElement);
//  const alttextLink = createAltTextLink(imgElement);
  const copyLink = !isIOSorIPadOS() ? createCopyLink(imgElement) : null;

  // --- 2. Separate into Link Groups ---
  const downloadButtons = [];
  if (downloadIMGLink) downloadButtons.push(downloadIMGLink);
//  if (downloadPDFLink) downloadButtons.push(downloadPDFLink);
//  if (dataLink) downloadButtons.push(dataLink); // Data is a form of download

//  const allButtons = [enlargeLink, copyLink, alttextLink];
  const allButtons = [enlargeLink, copyLink];
  
  // --- 3. Check Existing Links (To avoid duplicates and handle replacement) ---
  const existingLinksText = Array.from(linkContainer.querySelectorAll('a')).map(a => a.textContent.trim());

  // Function to check if a link based on its text already exists
  const isExisting = (text) => existingLinksText.includes(text);

  // --- 4. Render Buttons ---
  // Download links: Consolidate if count >= THRESHOLD
  const downloadOptionCount = downloadButtons.length;
  const THRESHOLD = 300; 
  let hasDownloadGroup = existingLinksText.includes('Downloads...'); 
  
  // Clean up any existing individual download links if a group is being created
  if (downloadOptionCount >= THRESHOLD || hasDownloadGroup) {
      ['Download as PNG', 'Download as PDF', 'Download data', 'View as PNG']
        .forEach(text => {
          const existing = Array.from(linkContainer.querySelectorAll('a')).find(a => a.textContent.trim() === text);
          if (existing) existing.remove();
        });
  }

  if (downloadOptionCount >= THRESHOLD) {
    const dropdownWrapper = createDropdownButton(svgObject, downloadButtons);
    if (!hasDownloadGroup) {
        linkContainer.appendChild(dropdownWrapper);
    } else {
        // If a dropdown already exists, we should probably replace it, 
        // but for simplicity here we just ensure the new one is added 
        // and rely on the cleanup above to remove the old *individual* links.
        // A more robust solution might find and replace the existing .dropdown-wrapper.
    }

  } else {
    // Render individually if 2 or fewer download options
    for (const link of downloadButtons) {
      if (link && !isExisting(link.textContent.trim())) {
        linkContainer.appendChild(link);
      }
    }
  }

  // Non-download links (Always rendered individually)
  for (const link of allButtons) {
    if (link && !isExisting(link.textContent.trim())) {
      // Handle the 'View as PNG' replacement case for the PNG link only
      if (link.textContent.trim() === 'Download as PNG' && existingLinksText.includes('View as PNG')) {
        const viewLink = Array.from(linkContainer.querySelectorAll('a')).find(a => a.textContent.trim() === 'View as PNG');
        if (viewLink) linkContainer.replaceChild(link, viewLink);
      } else {
        linkContainer.appendChild(link);
      }
    }
  }

  // A small cleanup to remove the 'Download...' button if the options drop below the threshold
  if (downloadOptionCount < THRESHOLD && hasDownloadGroup) {
    const existingDropdown = linkContainer.querySelector('.dropdown-wrapper');
    if (existingDropdown) existingDropdown.remove();
  }
}


function reloadSVGs() {
  // Get all object tags with the class "fig"
  const svgObjects = document.querySelectorAll('object.fig');
  svgObjects.forEach(obj => {
    // Get the original URL
    const originalData = obj.getAttribute('data');
    // Check if the URL already has a cache-busting parameter
    const url = new URL(originalData, window.location.href);
    console.log(`Adding cache-bust to ${url}`);
    // Append a new timestamp parameter to the URL
    url.searchParams.set('v', new Date().getTime());
    // Update the data attribute, which forces a reload
    obj.setAttribute('data', url.toString());
	console.log("New URL: ",url.toString())
  });
}

function createDropdownButton(svgObject, links) {
  if (!links || links.length === 0) return null;

  // 1. Create the main button element
  const dropdownButton = document.createElement('a');
  dropdownButton.href = '#';
  dropdownButton.textContent = 'Download...';
  // Use the same class as the simple-button for consistent styling
  dropdownButton.className = 'simple-button dropdown-toggle'; 
  
  // 2. Create the hidden container for the links
  const dropdownContent = document.createElement('div');
  dropdownContent.classList.add('dropdown-content');
  
  // 3. Populate the container with the actual links
  links.forEach(link => {
    // Modify links to be block elements for a cleaner dropdown list
    link.classList.remove('simple-button');
    link.classList.add('dropdown-item'); 
    dropdownContent.appendChild(link);
  });
  
  // 4. Create a wrapper to hold both the button and the content
  const wrapper = document.createElement('div');
  wrapper.classList.add('dropdown-wrapper');
  wrapper.appendChild(dropdownButton);
  wrapper.appendChild(dropdownContent);

  // 5. Add the click handler to toggle the dropdown
  dropdownButton.addEventListener('click', (e) => {
    e.preventDefault();
    // Toggle a class on the wrapper to show/hide the content
    wrapper.classList.toggle('open'); 
    
    // Add a quick fix to close all other dropdowns
    document.querySelectorAll('.dropdown-wrapper.open').forEach(otherWrapper => {
      if (otherWrapper !== wrapper) {
        otherWrapper.classList.remove('open');
      }
    });

    // Optional: Close dropdown when clicking outside
    function closeDropdown(event) {
        if (!wrapper.contains(event.target)) {
            wrapper.classList.remove('open');
            document.removeEventListener('click', closeDropdown);
        }
    }
    // Only add listener if we're opening it
    if (wrapper.classList.contains('open')) {
        setTimeout(() => { // Small delay to avoid immediate closure
            document.addEventListener('click', closeDropdown);
        }, 0);
    } else {
        document.removeEventListener('click', closeDropdown);
    }
  });

  return wrapper;
}
