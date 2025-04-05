
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

function copySVGasPNG(svgObject) {
  renderSVGtoPNGBlob(svgObject, async (blob) => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('Copied to clipboard as PNG!');
    } catch (err) {
      console.error('Clipboard write failed', err);
      showToast('Failed to copy image to clipboard.');
    }
  });
}

// function downloadSVGasPNG(svgObject) {
//  renderSVGtoPNGBlob(svgObject, (blob) => {
//    const DOMURL = window.URL || window.webkitURL || window;
//    const url = DOMURL.createObjectURL(blob);
//    const a = document.createElement('a');
//    a.href = url;
//    a.download = `${svgObject.getAttribute('data').split('/').pop().replace('.svg', '')}.png`;
//    document.body.appendChild(a);
//    a.click();
//    document.body.removeChild(a);
//    DOMURL.revokeObjectURL(url);
//  });
//}

function downloadSVGasPNG(svgObject) {
  try {
	  const svg = svgObject.contentDocument.querySelector('svg');
	  
	  // Make a copy (clone) of the SVG object so we can manipulate it
	  const clonedSvg = svg.cloneNode(true);
	  
	  // Remove any foreignObject elements from the clone. These are seen by the browser as cross-origin, and cause conversion (toBlob) to fail.
      const foreignObjects = clonedSvg.querySelectorAll('foreignObject');
      foreignObjects.forEach(fo => fo.remove());
	  
	  // Create a canvas element (bitmap)
	  const canvas = document.createElement('canvas');

	  // To improve antialiasing in the final render, first convert to raster at double the desired resolution before later scaling down again
	  const scale = 2;
	  canvas.width = 1852 * scale;
	  // Maintain aspect ratio
	  const svgRect = svg.getBoundingClientRect();
	  canvas.height = Math.round(svgRect.height/svgRect.width*canvas.width);
	  
	  const ctx = canvas.getContext('2d');
	  
	  // Convert SVG to a data URL
	  const svgData = new XMLSerializer().serializeToString(clonedSvg);
	  const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
	  const DOMURL = window.URL || window.webkitURL || window;
	  const svgUrl = DOMURL.createObjectURL(svgBlob);
	  
	  // Create a bitmap from the SVG
	  const img = new Image();
	  img.onload = function() {
		// First draw a white background
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// Then draw the image on the canvas
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		DOMURL.revokeObjectURL(svgUrl);
		
		let finalCanvas;
		if (scale === 1) {
			finalCanvas = canvas;
		} else {
		  // Create a smaller canvas for the final output
		  finalCanvas = document.createElement('canvas');
          finalCanvas.width = canvas.width / scale;
          finalCanvas.height = canvas.height / scale;
          const finalCtx = finalCanvas.getContext('2d');
          // Draw the high-resolution canvas onto the smaller canvas
          finalCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                         0, 0, finalCanvas.width, finalCanvas.height);
		}
		
		// Convert canvas to PNG and initiate download
		finalCanvas.toBlob(function(blob) {
		  const url = DOMURL.createObjectURL(blob);
		  const a = document.createElement('a');
		  a.href = url;
		  a.download = `${svgObject.getAttribute('data').split('/').pop().replace('.svg', '')}.png`;
		  document.body.appendChild(a);
		  a.click();
		  document.body.removeChild(a);
		  DOMURL.revokeObjectURL(url);
		}, 'image/png');
	  };
	  img.src = svgUrl;
  } catch (error) {
	  console.warn("Unable to access SVG content! (Are you running locally?)",error);
  }
}

function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '1rem';
  toast.style.right = '1rem';
  toast.style.background = 'rgba(0,0,0,0.8)';
  toast.style.color = 'white';
  toast.style.padding = '0.5rem 1rem';
  toast.style.borderRadius = '6px';
  toast.style.zIndex = 10000;
  toast.style.fontSize = '0.9rem';
  toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = '1');

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}

function createDownloadLink(svgObject) {
  // Create the link
  const downloadLink = document.createElement('a');
  downloadLink.href = '#';
  downloadLink.textContent = 'Download as PNG';
  downloadLink.className = 'download-PNG';
  // Add click event handler
  downloadLink.addEventListener('click', (e) => {
    e.preventDefault(); // prevent browser trying to navigate to https://.../#
    downloadSVGasPNG(svgObject);
  });
  return downloadLink;
}

function createCopyLink(svgObject) {
  const copyLink = document.createElement('a');
  copyLink.href = '#';
  copyLink.textContent = 'Copy to clipboard';
  copyLink.className = 'copy-PNG';
  copyLink.addEventListener('click', (e) => {
    e.preventDefault();
    copySVGasPNG(svgObject);
  });
  return copyLink;
}

/* Given an SVG object,
   1. Create a link that will generate a PNG file and download it
   2. Add this link into the parent of the SVG object as:
      a. If there is already a link "View as PNG", replace that link with the new one
	  b. If there is no such link, append the new link within the existing <p> tag
	  c. If there is no <p> tag following the SVG object, simply append the new download link within the parent of the SVG object.
*/
function replacePNGlink(svgObject) {
  const container = svgObject.parentNode;
  // Append the link after the SVG object
  const downloadLink = createDownloadLink(svgObject);
  const copyLink = createCopyLink(svgObject);
  
  const nextSibling = svgObject.nextElementSibling;
  
//  if (nextSibling && nextSibling.tagName.toLowerCase() === 'p') {
  if (nextSibling && nextSibling.matches('p, div')) {
    const links = nextSibling.querySelectorAll('a');
    for (const link of links) {
      if (link.innerHTML.trim() === 'Download as PNG') {
		return ; // already exists
	  }
      if (link.innerHTML.trim() === 'View as PNG') {
        link.parentNode.replaceChild(downloadLink, link);
        return;
      }
    }
    // If the specific <a> tag is not found, append new content to the <p> tag
    const separator1 = document.createTextNode(' | ');
    const separator2 = document.createTextNode(' | ');
    nextSibling.appendChild(separator1);
    nextSibling.appendChild(downloadLink);
    nextSibling.appendChild(separator2);
	nextSibling.appendChild(copyLink);
  } else {
    container.appendChild(downloadLink);
    const separator2 = document.createTextNode(' | ');
    nextSibling.appendChild(separator2);
	container.appendChild(copyLink);
  }
}

