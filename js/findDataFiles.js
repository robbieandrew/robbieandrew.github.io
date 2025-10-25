
function updateHighlight() {
  const items = document.querySelectorAll("#id_siteList li");
  items.forEach((item, index) => {
    item.classList.toggle("highlighted", index === highlightedIndex);
  });
}



async function loadSiteDataFiles(siteCode, partialPath) {
  try {
    const dataFiles = await fetchGitHubDataFiles(siteCode, partialPath);
	if (dataFiles) {
      availableDataFiles = dataFiles;
      console.log(`Full list of data files found for ${siteCode}: ${availableDataFiles}`);
      return true;
	} else {
      console.log("No data files found");
	  return false;
	}
  } catch (error) {
    console.error("Failed to initialize SVGs:", error);
    return false;
  }
}

function fetchGitHubDataFiles(siteCode,partialPath) {
  console.log("Looking for data files under: ",partialPath)
  const folder = siteCode ? `${partialPath}/${siteCode}` : partialPath;
  const githubApiUrl = `https://api.github.com/repos/robbieandrew/robbieandrew.github.io/contents/${folder}`;
//  const githubApiUrl = `https://api.github.com/repos/robbieandrew/robbieandrew.github.io/contents/${partialPath}/${siteCode}`;

  return fetch(githubApiUrl)
    .then(response => {
      if (!response.ok) {
	    console.log(response.status)
        if (response.status === 404) {
		  console.log("404 error: data folder not found")
          return []; // No data folder for this ISO, not an error
        } else {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
      }
      return response.json();
    })
    .then(files => {
      if (!Array.isArray(files)) {
        throw new Error("Invalid API response format.");
      }

      return files
        .filter(file => file.name.endsWith(".csv"))
        .map(file => file.name); // Just the filenames
    })
    .catch(error => {
      console.error("Fetch failed:",error);
      return [];
    });
}

/* fetchGitHubImages
   Get the list of all images (specifically their URLs) in the country's subfolder
   Because I cannot get a directory listing of, e.g., robbieandrew.github.io/country/img/DEU, I instead get the list of files in that folder using GitHub's API, then map the path back to github.io. */
function fetchGitHubImages(siteCode,partialPath) {
  const folder = siteCode ? `${partialPath}/${siteCode}` : partialPath;
  const githubApiUrl = `https://api.github.com/repos/robbieandrew/robbieandrew.github.io/contents/${folder}`;
//  const githubApiUrl = `https://api.github.com/repos/robbieandrew/robbieandrew.github.io/contents/${partialPath}/${siteCode}`;

  return fetch(githubApiUrl)
    .then(response => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No images found for ${siteCode} (folder missing)`);
        } else {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
      }
      return response.json();
    })
    .then(files => {
      if (!Array.isArray(files)) {
        throw new Error("Invalid API response format.");
      }

      const imageUrls = files
        .filter(file => file.name.match(/\.(jpg|png|gif|svg)$/i)) // Only images
		// Generate a URL to access the file via the webpage, rather than github.com
		.map(file => siteCode ? `img/${siteCode}/${file.name}` : `img/${file.name}`);
//        .map(file => `img/${siteCode}/${file.name}`);

      if (imageUrls.length === 0) {
        throw new Error(`No valid images found in ${siteCode} folder.`);
      }

      console.log(`Full list of image files found for ${siteCode}: ${imageUrls}`);

      return imageUrls;
    })
    .catch(error => {
      console.error(error.message);
      return null; // Return null to indicate failure
    });
}

/* getCachedImageFolders
   Get the list of image sub-folders (ISO codes), which indicates which countries we have images for. This list is cached to prevent too many calls to api.github.com.
*/ 
function getCachedImageFolders(partialPath) {
  const cleanPath = partialPath.replace(/[^\w-]/g, '_');
  const CACHE_KEY = `imageFolderList_${cleanPath}`;
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  const now = Date.now();

  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { folders, timestamp } = JSON.parse(cached);
    if (now - timestamp < CACHE_DURATION) {
      console.log("Using cached folder list");
      return Promise.resolve(folders);
    }
  }

  const apiUrl = `https://api.github.com/repos/robbieandrew/robbieandrew.github.io/contents/${partialPath}`;

  return fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch folder list");
      return res.json();
    })
    .then(data => {
      const folderNames = data
        .filter(item => item.type === "dir")
        .map(item => item.name.toUpperCase());

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        folders: folderNames,
        timestamp: now
      }));

      return folderNames;
    })
    .catch(err => {
      console.error("Error fetching image folders:", err);
      return []; // fallback: empty list
    });
}

/* loadSiteImages
Obtains the URLs of all images for the given country, and displays them on the page. The list of images is obtained from api.github.com and cached, to prevent calling the API too often.
e.g. loadSiteImages(site.iso, "country/img");
*/
function loadSiteImages(siteCode,partialPath) {
  // caching is to prevent issues with too much use of the github.com API
  const CACHE_KEY = `imageCache_${partialPath}`;
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  let cachedData = localStorage.getItem(CACHE_KEY);
  let imageData = cachedData ? JSON.parse(cachedData) : { data: {}, timestamps: {} };
  let now = Date.now();

  if (imageData.data[siteCode] && now - (imageData.timestamps[siteCode] || 0) < CACHE_DURATION) {
    console.log(`Using cached images for ${siteCode}`);
    displayImages(siteCode, imageData.data);
  } else {
    console.log(`Fetching new images for ${siteCode}`);
    fetchGitHubImages(siteCode,partialPath)
      .then(newImages => {
        if (newImages) {
          imageData.data[siteCode] = newImages;
          imageData.timestamps[siteCode] = now;
          localStorage.setItem(CACHE_KEY, JSON.stringify(imageData));
          displayImages(siteCode, imageData.data);
        } else {
          displayErrorMessage(`No images available for ${siteCode}`);
        }
      })
      .catch(error => {
        console.error("Error loading images:", error);
        displayErrorMessage("An error occurred while fetching images.");
      });
  }
}


function displayErrorMessage(message) {
  const imageContainer = document.getElementById("imageContainer");
  imageContainer.innerHTML = `<p class="pure-u-1" style="color: red;">${message}</p>`;
}

function displayImages(siteCode, imageData) {
  const imageContainer = document.getElementById("imageContainer");
  imageContainer.innerHTML = ""; // Remove previous images

  if (!imageData[siteCode] || imageData[siteCode].length === 0) {
    console.error(`No images found for ${siteCode}`);
    return;
  }

  imageData[siteCode].forEach(image => {
    const div = document.createElement("div");
    div.className = "pure-u-1 pure-u-md-1-2 pure-u-lg-1-3";

    if (image.endsWith(".svg")) {
      const object = document.createElement("object");
      object.setAttribute('data', image);
      object.type = "image/svg+xml";
      object.className = "fig";

      div.appendChild(object);
    } else {
      const img = document.createElement("img");
      img.src = image;
      img.style.width = "200px";

      div.appendChild(img);
    }

    imageContainer.appendChild(div);
  });
  
    // Add buttons for every SVG on the page
	let warnedAboutMissingJS = false;
    document.querySelectorAll('object[type="image/svg+xml"]').forEach(svgObject => {
      svgObject.addEventListener('load', () => {
		addSVGbuttons(svgObject);
		if (typeof addSVGmetadata === 'function') {
		  addSVGmetadata(svgObject);
		} else if (!warnedAboutMissingJS) { // Only warn once
          console.warn("addSVGmetadata is not defined (include svg-metadata.js!)");
          warnedAboutMissingJS = true; 
		}
	  });
	  // Add a class to the parent div
      let container = svgObject.closest("div");
      if (container) {
        container.classList.add("figure-group");
      }
    });
}

