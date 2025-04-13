document.addEventListener('DOMContentLoaded', function () {
  // Find all <object> elements with SVGs
  const svgObjects = document.querySelectorAll('object[type="image/svg+xml"]');

  function createStructuredData(svgUrl, svgTitle) {
    return {
      "@context": "http://schema.org",
      "@type": "ImageObject",
      "contentUrl": svgUrl,
      "description": svgTitle,
      "name": svgTitle,
      "encodingFormat": "image/svg+xml"
    };
  }

  svgObjects.forEach(function (svgObject) {
    // Function to handle SVG processing
    function processSVG() {
      const svgDoc = svgObject.contentDocument;

      if (!svgDoc) return false; // If still not ready, return false

      const titleElement = svgDoc.querySelector('title');
      const svgTitle = titleElement ? titleElement.textContent.trim() : "No Title";

      // Create and inject JSON-LD structured data
	  console.log(`Adding structure data: ${svgTitle}`)
      const structuredData = createStructuredData(svgObject.data, svgTitle);
      const script = document.createElement('script');
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return true; // Processing successful
    }

    // Handle failed load with fallback text
    svgObject.onerror = function () {
      if (!svgObject.innerHTML.trim()) {
        svgObject.innerHTML = "SVG could not be loaded";
      }
    };

    // Try processing the SVG when it loads
    svgObject.addEventListener('load', function () {
      if (!processSVG()) {
        // Retry every 100ms for up to 1 second if contentDocument is not ready
        let attempts = 0;
        const interval = setInterval(function () {
          if (processSVG() || attempts++ >= 10) {
            clearInterval(interval);
          }
        }, 100);
      }
    });
  });
});
