

const NDJSON_FILE_PATH = 'https://robbieandrew.github.io/carsales/carupdates_30.json'; 
        
/**
 * Fetches the NDJSON file and processes the data into table row elements.
 */
async function fetchAndProcessUpdates() {
    try {
        const response = await fetch(NDJSON_FILE_PATH);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();

        const lines = text.trim().split('\n').filter(line => line.length > 0);
        let updates = lines.map(line => JSON.parse(line));
        
        // Sort in reverse order (latest update first)
        updates.reverse(); 

        const tableData = updates.map(item => {
            // Column 1: Geography
            const geography = item.dataset;
            
            // Column 2: Latest data (e.g., "Sep 2025")
            const finalMonth = item.finalmonth.split(' ')[0].substring(0, 3);
            const finalYear = item.finalmonth.split(' ')[1];
            const latestData = `${finalMonth} ${finalYear}`;
            
            // Column 3: Updated on (e.g., "21 Oct 2025")
            const dateObj = new Date(item.timestamp);
            const updateDay = dateObj.getDate();
            const updateMonth = dateObj.toLocaleString('en-US', { month: 'short' });
            const updateYear = dateObj.getFullYear();
            const updatedOn = `${updateDay} ${updateMonth} ${updateYear}`;
            
            return [geography, latestData, updatedOn];
        });

        return tableData;

    } catch (error) {
        console.error('Error fetching or parsing NDJSON:', error);
        return [['Error loading data', '', '']]; 
    }
}

/**
 * Toggles the visibility of the updates container AND changes the button text.
 */
function toggleUpdates() {
    const container = document.getElementById('updates-container');
    const toggleButton = document.getElementById('toggle-button');
    
    const isHidden = container.style.display === 'none' || container.style.display === '';

    if (isHidden) {
        // If it's hidden, show it and change text to "hide"
        container.style.display = 'block';
        toggleButton.textContent = 'Hide list of recent updates'; 
    } else {
        // If it's visible, hide it and change text to "show"
        container.style.display = 'none';
        toggleButton.textContent = 'Show list of recent updates';
    }
}

/**
 * Main function to load data and set up event listeners.
 * Renamed from init() for specificity.
 */
async function setupUpdateViewer() {
    const toggleButton = document.getElementById('toggle-button');
    const tableBody = document.getElementById('updates-tbody');
    
    // 1. Load and display data
    const tableData = await fetchAndProcessUpdates();
    
    tableBody.innerHTML = ''; 
    
    tableData.forEach(rowData => {
        const tr = document.createElement('tr');
        
        rowData.forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });

    // 2. Set up the click handler
    toggleButton.addEventListener('click', toggleUpdates);
}

// Run the setup function when the script loads
setupUpdateViewer();
