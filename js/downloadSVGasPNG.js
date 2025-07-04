

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

function copySVGasPNG(svgObject, anchorElement) {
  renderSVGtoPNGBlob(svgObject, async (blob) => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToastBelowElement(anchorElement,'Copied to clipboard as PNG!');
    } catch (err) {
      console.error('Clipboard write failed', err);
      showToastBelowElement(anchorElement,'Failed to copy image to clipboard.');
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
  toast.textContent = message;
  toast.style.position = 'absolute';
  toast.style.top = `${rect.bottom + scrollTop + 4}px`; // 4px spacing below the element
  toast.style.background = 'rgba(0,0,0,0.85)';
  toast.style.color = 'white';
  toast.style.padding = '0.4rem 0.8rem';
  toast.style.borderRadius = '6px';
  toast.style.fontSize = '0.85rem';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
  toast.style.zIndex = 10000;
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.2s ease';

//  toast.style.left = `${rect.left + scrollLeft}px`; // left-aligned with element above
  const anchorCenter = rect.left + scrollLeft + (rect.width / 2);
  toast.style.left = `${anchorCenter}px`;
  toast.style.transform = 'translateX(-50%)';
  toast.style.textAlign = 'center';

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}

/*function createEnlargeLink(image) {
  const enlargeLink = document.createElement('a');
  enlargeLink.href = image;
  enlargeLink.target = "_self";
  enlargeLink.textContent = "Enlarge this figure";
  enlargeLink.className = 'simple-button';
  return enlargeLink;
}*/

function createDownloadLink(svgObject) {
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

function createEnlargeLink(svgObject) {
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
}

function createCopyLink(svgObject) {
  const copyLink = document.createElement('a');
  copyLink.href = '#';
  copyLink.textContent = 'Copy to clipboard';
  copyLink.className = 'simple-button';
  copyLink.addEventListener('click', (e) => {
    e.preventDefault();
    copySVGasPNG(svgObject, copyLink);
  });
  return copyLink;
}

function createAltTextLink(svgObject) {
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
        showToastBelowElement(altLink,'Failed to alt text to clipboard.');
        console.error("Failed to copy:", err);
      });
  });
  return altLink;
}

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
  const isoCode = urlParts[imgIndex + 1]; // The element immediately following 'img' is the isoCode

  if (typeof availableDataFiles === 'undefined' || !Array.isArray(availableDataFiles)) {
//    console.log(`No data file list available for ${isoCode}. Skipping data link.`);
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
      const dataFilePath = `data/${isoCode}/${name}`;
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

/*function createSimpleDataDownloadLink(svgObject) {
  const svgURL = svgObject.data;
  if (!svgURL) {
    console.log("SVG object has no data URL.");
    return null;
  }

  const fileName = svgURL.split('/').pop(); // Remove path to leave filename
  const csvname = fileName.replace('.svg', '.csv');
  const dataFilePath = `data/${csvname}`;

  fetch(dataFilePath, { method: 'HEAD' }).then(response => {
    if (response.ok) {
      const link = document.createElement('a');
      link.href = "#";
      link.className = 'simple-button';
      link.textContent = 'Download data';
      link.addEventListener('click', (event) => {
        event.preventDefault();

        const hiddenLink = document.createElement('a');
        hiddenLink.href = dataFilePath;
        hiddenLink.download = `${csvname}`;
        document.body.appendChild(hiddenLink);
        hiddenLink.click();
        document.body.removeChild(hiddenLink);
      });
	  return link ;
    } else {
//      console.log(`Data file not found: ${dataFilePath}`);
      return null ;
    }
  }).catch(err => {
    console.log(`Error checking data file: ${err}`);
    return null ;
  });
}*/



/* Given an SVG object,
   1. Create a link that will generate a PNG file and download it
   2. Add this link into the parent of the SVG object as:
      a. If there is already a link "View as PNG", replace that link with the new one
	  b. If there is no such link, append the new link within the existing <p> tag
	  c. If there is no <p> tag following the SVG object, simply append the new download link within the parent of the SVG object.
*/
function addSVGbuttons(svgObject) {
  const container = svgObject.parentNode;
  let linkContainer = svgObject.nextElementSibling;

  // Create the download and copy links
  const downloadLink = createDownloadLink(svgObject);
  const copyLink = createCopyLink(svgObject);
  const enlargeLink = createEnlargeLink(svgObject);
  const alttextLink = createAltTextLink(svgObject);
  const dataLink = createDataDownloadLink(svgObject);
//  const dataLinkSimple = createSimpleDataDownloadLink(svgObject);

  // Ensure the link container (p or div) exists
  if (!linkContainer || (!linkContainer.matches('p') && !linkContainer.matches('div'))) {
    linkContainer = document.createElement('p');
    container.insertBefore(linkContainer, svgObject.nextSibling);
  }

  // Add a class to the button group to allow styling
  linkContainer.classList.add("svg-button-group");

  // Add buttons, but only if they're not already there
  let hasDownload = false;
  let hasCopy = false;
  let hasEnlarge = false;
  let hasALT = false ;
  let hasData = false ;
  const links = linkContainer.querySelectorAll('a');

  // Check for existing links
  for (const link of links) {
	const linktext = link.textContent.trim();
    if (linktext === 'Download as PNG') hasDownload = true;
    else if (linktext === 'Copy to clipboard') hasCopy = true;
    else if (linktext === 'Enlarge this figure') hasEnlarge = true;
    else if (linktext === 'View as PNG') {
      linkContainer.replaceChild(downloadLink, link);
      hasDownload = true;
    } else if (linktext === 'Alt') hasALT = true;
	else if (linktext === 'Download data') hasData = true;
  }

  if (!hasData) {
    if (dataLink) linkContainer.appendChild(dataLink);
//	else if (dataLinkSimple) {
//		console.log("Adding dataLinkSimple");
//		linkContainer.appendChild(dataLinkSimple);
//	}
  }
  if (!hasEnlarge && enlargeLink) linkContainer.appendChild(enlargeLink);
  if (!hasDownload && downloadLink) linkContainer.appendChild(downloadLink);
  if (!hasCopy && !isIOSorIPadOS() && copyLink) linkContainer.appendChild(copyLink);
  if (!hasALT && alttextLink) linkContainer.appendChild(alttextLink);
}

