
function downloadSVGasPNG(svgObject) {
  try {
	  const svg = svgObject.contentDocument.querySelector('svg');
	  
	  // Make a copy (clone) of the SVG object so we can manipulate it
	  const clonedSvg = svg.cloneNode(true);
	  
	  // Remove foreignObject elements from the clone. These are seen by the browser as cross-origin, and cause conversion to fail.
      const foreignObjects = clonedSvg.querySelectorAll('foreignObject');
      foreignObjects.forEach(fo => fo.remove());
	  
	  // Create a canvas element (raster)
	  const canvas = document.createElement('canvas');

	  // Set canvas dimensions, maintaining aspect ratio
	  const svgRect = svg.getBoundingClientRect();
	  const width = Math.round(svgRect.width);
	  const height = Math.round(svgRect.height);
	  
	  const scale = 2;
	  canvas.width = 1852 * scale;
	  // Maintain aspect ratio
	  canvas.height = Math.round(svgRect.height/svgRect.width*canvas.width);
	  
	  const ctx = canvas.getContext('2d');
	  
	  // Convert SVG to a data URL
	  const svgData = new XMLSerializer().serializeToString(clonedSvg);
	  const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
	  const DOMURL = window.URL || window.webkitURL || window;
	  const svgUrl = DOMURL.createObjectURL(svgBlob);
	  
	  // Create an image from the SVG
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
	  console.warn("Unable to access SVG content! (Are you running locally?",error);
  }
}

function createDownloadLink(svgObject) {
  // Create the link
  const downloadLink = document.createElement('a');
  downloadLink.href = '#';
  downloadLink.textContent = 'Download as PNG';
  downloadLink.className = 'download-PNG';
  // Add click event
  downloadLink.addEventListener('click', (e) => {
    e.preventDefault(); // prevent browser trying to navigate to https://.../#
    downloadSVGasPNG(svgObject);
  });
  return downloadLink;
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

  const nextSibling = svgObject.nextElementSibling;
  
  if (nextSibling && nextSibling.tagName.toLowerCase() === 'p') {
    const links = nextSibling.querySelectorAll('a');
    for (const link of links) {
      if (link.innerHTML.trim() === 'View as PNG') {
        link.parentNode.replaceChild(downloadLink, link);
        return;
      }
    }
    // If the specific <a> tag is not found, append new content to the <p> tag
    const separator = document.createTextNode(' | ');
    nextSibling.appendChild(separator);
    nextSibling.appendChild(downloadLink);
  } else {
    container.appendChild(downloadLink);
  }
}

