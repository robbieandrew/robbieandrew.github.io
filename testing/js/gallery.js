// --- Configuration for this specific page ---
// IMPORTANT: Define your image folder path and CSV details here.
const MAIN_PATH = "testing"; // e.g., 'img/my-folder'
const ORDER_CSV_FILENAME = "fileorder.csv"; // The name of the CSV file in that folder
const FILENAME_COLUMN_HEADER = "filename";     // The column name in the CSV containing the SVG filename
// ---------------------------------------------


/**
 * Fetches and parses the CSV file to determine the required image display order.
 * @param {string} csvUrl - The direct URL to the raw CSV file.
 * @returns {Promise<string[] | null>} A promise that resolves with an array of ordered filenames.
 */
async function fetchCSVOrder(csvUrl) {
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const text = await response.text();
    const rows = text.trim().split('\n');

    if (rows.length < 2) {
      console.error("CSV file is empty or missing data rows.");
      return null;
    }

    // 1. Parse the header row
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
    const filenameIndex = headers.indexOf(FILENAME_COLUMN_HEADER.toLowerCase());

    if (filenameIndex === -1) {
      console.error(`CSV header missing required column: ${FILENAME_COLUMN_HEADER}`);
      return null;
    }

    // 2. Extract filenames from the data rows
    const orderedFilenames = [];
    for (let i = 1; i < rows.length; i++) {
      const columns = rows[i].split(',').map(c => c.trim());
      if (columns[filenameIndex]) {
        // Remove surrounding quotes if present, assuming simple CSV parsing
        const filename = columns[filenameIndex].replace(/^"|"$/g, ''); 
        orderedFilenames.push(filename);
      }
    }

    console.log("Image display order determined from CSV:", orderedFilenames);
    return orderedFilenames;

  } catch (error) {
    console.error("Error fetching or parsing CSV:", error);
    return null;
  }
}

/**
 * Displays images in the order specified by the CSV.
 * This function is adapted from the original `displayImages` logic.
 * * @param {string[]} orderedFilenames - Array of filenames in the desired order.
 * @param {string[]} availableImageUrls - Array of all image URLs found in the folder.
 */
function displayOrderedImages(orderedFilenames, availableImageUrls) {
  const imageContainer = document.getElementById("imageContainer");
  if (!imageContainer) {
    console.error("Image container element not found.");
    return;
  }
  imageContainer.innerHTML = ""; // Clear previous content

  // Map available URLs to their base filename for quick lookup
  const imageMap = new Map();
  availableImageUrls.forEach(url => {
    // Extract the base filename (e.g., 'image1.svg' from 'images/my-folder/image1.svg')
    const filename = url.substring(url.lastIndexOf('/') + 1);
    imageMap.set(filename, url);
  });

  let warnedAboutMissingJS = false;
  let displayedCount = 0;
  
  orderedFilenames.forEach(filename => {
    const fullUrl = imageMap.get(filename);

    if (fullUrl) {
      const div = document.createElement("div");
      // Use Tailwind/PureCSS classes for responsiveness (from HTML file)
      div.className = "pure-u-1 sm:pure-u-1-2 md:pure-u-1-3 lg:pure-u-1-4 p-2";

      if (filename.toLowerCase().endsWith(".svg")) {
        const object = document.createElement("object");
        object.setAttribute('data', fullUrl);
        object.type = "image/svg+xml";
        object.className = "w-full h-auto shadow-md rounded-lg fig transition duration-300 ease-in-out transform hover:scale-[1.02] bg-white";
        object.addEventListener('load', () => {
          // Check if the original function exists (it's defined in findDataFiles.js now)
          if (typeof addSVGbuttons === 'function') addSVGbuttons(object);
          if (typeof addSVGmetadata === 'function') {
		    addSVGmetadata(object);
		  } else if (!warnedAboutMissingJS) { // Only warn once
            console.warn("addSVGmetadata is not defined (include svg-metadata.js!)");
            warnedAboutMissingJS = true; 
		  }
        });
        
        div.appendChild(object);
      } else {
        const img = document.createElement("img");
        img.src = fullUrl;
        img.alt = filename;
        img.className = "w-full h-auto rounded-lg shadow-lg object-cover transition duration-300 ease-in-out transform hover:shadow-xl";

        div.appendChild(img);
      }
      
      // Add a class to the parent div (figure-group)
      div.classList.add("figure-group");

      imageContainer.appendChild(div);
      displayedCount++;
    } else {
      console.warn(`Image file specified in CSV not found in folder: ${filename}`);
    }
  });

  if (displayedCount === 0) {
    displayErrorMessage("No images could be displayed. Check your CSV file and folder path.");
  }
}

/**
 * Main initialization function for the gallery.
 */
async function initGallery() {
  const csvPath = `${MAIN_PATH}/${ORDER_CSV_FILENAME}`;
  const imageFolderPath = `${MAIN_PATH}/img`
  
  const rawCsvUrl = `https://api.github.com/repos/robbieandrew/robbieandrew.github.io/contents/${csvPath}`;
  
  // 1. Get the image order from the CSV file
  const orderedFilenames = await fetchCSVOrder(rawCsvUrl);

  if (!orderedFilenames || orderedFilenames.length === 0) {
    displayErrorMessage(`Could not determine image order from ${ORDER_CSV_FILENAME}.`);
    return;
  }

  // 2. Get the list of available image URLs in the folder
  // We pass null for siteCode to indicate a single, non-ISO-coded folder
  const availableImageUrls = await fetchGitHubImages(null, imageFolderPath);

  if (!availableImageUrls || availableImageUrls.length === 0) {
    displayErrorMessage(`No images found in the folder: ${imageFolderPath}`);
    return;
  }
  
  // 3. Display the images in the specified order
  displayOrderedImages(orderedFilenames, availableImageUrls);
}

// Start the gallery when the window loads
window.onload = initGallery;
