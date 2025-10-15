  let availableDataFiles = [];

  document.addEventListener("DOMContentLoaded", async () => {
    const url_path = window.location.pathname;
    const parts = url_path.startsWith('/') ? url_path.substring(1).split('/') : url_path.split('/');
	// obtaining the list of data files could sometimes take a while, allowing some SVGs to already be loaded before it's finished. In that case we can't add an event listener to process the SVG after it's loaded, because it's already loaded. So below we handle these two cases: SVG already loaded, then process it; SVG not yet loaded, add an event listener.
	const loaded = await loadSiteDataFiles("data",parts[0]);

	document.querySelectorAll('object[type="image/svg+xml"]').forEach(svgObject => {
	  function handleSVGLoad() {
		addSVGbuttons(svgObject);
		addSVGmetadata(svgObject);

		const svgDoc = svgObject.contentDocument;
		if (svgDoc) {
		  const titleElement = svgDoc.querySelector("title");
		  if (titleElement) {
			const titleText = titleElement.textContent.trim();
			svgObject.setAttribute("data-title", titleText);
		  }
		}

		const container = svgObject.closest("div");
		if (container) {
		  container.classList.add("figure-group");
		}
	  }

	  if (svgObject.contentDocument && svgObject.contentDocument.rootElement) {
		// Already loaded, probably due to fast load before listener was attached
		handleSVGLoad();
	  } else {
		svgObject.addEventListener("load", handleSVGLoad);
	  }
	});
	
  });

