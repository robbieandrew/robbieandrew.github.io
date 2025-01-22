<script>
document.addEventListener('DOMContentLoaded', function() {
  // Find all <object> tags with SVGs and all inline <svg> elements
  const svgObjects = document.querySelectorAll('object[type="image/svg+xml"]');
  const inlineSvgs = document.querySelectorAll('svg');

  // Function to generate JSON-LD structured data
  function createStructuredData(svgUrl, svgTitle) {
    return {
      "@context": "http://schema.org",
      "@type": "ImageObject",
      "contentUrl": svgUrl,  // URL of the SVG
      "description": svgTitle,  // Use the <title> content for description
      "name": svgTitle,  // Use the <title> content for name
      "encodingFormat": "image/svg+xml"
    };
  }
  // Process all <object> tags
  svgObjects.forEach(function(svgObject) {
    // Add an event listener for when the SVG fails to load
    svgObject.onerror = function() {
      const svgDoc = svgObject.contentDocument;  // Access the SVG inside the <object>
      const svgTitle = svgDoc.querySelector('title') ? svgDoc.querySelector('title').textContent : "No Title";  // Get the <title> or default to "No Title"
      
      // Set fallback text to the <title> content in case of an error
      svgObject.innerHTML = svgTitle;  // Fallback text = <title> content
    };

    // Ensure that the <object> tag has loaded and contains an SVG
    svgObject.addEventListener('load', function() {
      const svgDoc = svgObject.contentDocument;  // Access the SVG inside the <object>
      const svgTitle = svgDoc.querySelector('title') ? svgDoc.querySelector('title').textContent : "No Title";  // Get the <title> or default to "No Title"
      
      // Create the JSON-LD structured data
      const structuredData = createStructuredData(svgObject.data, svgTitle);
      
      // Inject the JSON-LD structured data into the page
      const script = document.createElement('script');
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    });
  });
});
</script>
