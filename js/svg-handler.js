  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('object[type="image/svg+xml"]').forEach(svgObject => {
	  svgObject.addEventListener("load", function () {
		// Add a PNG download link for every SVG on the page
        addSVGbuttons(svgObject);
		addSVGmetadata(svgObject);
		
		// Insert every SVG's title element text as data-title in the object, for better visibility to search engines
        let svgDoc = svgObject.contentDocument;
        if (svgDoc) {
          let titleElement = svgDoc.querySelector("title");
          if (titleElement) {
            let titleText = titleElement.textContent.trim();
            svgObject.setAttribute("data-title", titleText);
          }
        }

		// Add a class to the parent div
        let container = svgObject.closest("div");
        if (container) {
          container.classList.add("figure-group");
        }


	  });
	});
  });
