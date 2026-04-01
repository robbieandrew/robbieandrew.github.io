
(function() {
  // Dynamically get the page title from the <title> tag
  const pageTitle = document.title || "Data Downloads";
  
  // 1. Create and inject the Modal HTML
  const modalHTML = `
    <div id="citationModal" class="modal-overlay" style="display:none;">
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h2 style="margin-top:0">Thanks for downloading the data!</h2>
        <p>Collating and maintaining these datasets is a <strong>significant</strong> undertaking.</p>
        <p>If you use these data in your work, <strong>please consider providing a citation:</strong></p>

        <div class="citation-box">
          <em>Andrew, R. ${new Date().getFullYear()}: "${pageTitle}", available at: ${window.location.href.split('#')[0].split('?')[0]} (accessed: ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())})</em>
        </div>

        <p>Questions? Feedback? Reach out via the <a href="https://forms.gle/jeuyvoeXqBQMnsGX8">contact form</a>.</p>
        
        <div style="text-align: center; margin-top: 20px;">
          <button class="pure-button pure-button-primary close-modal-btn">Close & Continue</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('citationModal');
  const closeElements = modal.querySelectorAll('.modal-close, .close-modal-btn');

  // 2. Logic functions
  const openModal = () => modal.style.display = 'flex';
  const closeModal = () => modal.style.display = 'none';

  // 3. Event Listeners
  closeElements.forEach(el => el.addEventListener('click', closeModal));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Close if clicking the dimmed background
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

// 4. Global Interceptor specifically for Data Downloads
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // Logic: 
    // 1. It's a link to a data file (.csv or .zip)
    // 2. OR it's a button explicitly labeled "Download data" 
    // This avoids triggering on "Download as PNG" or "Download as PDF"
    const isDataFile = target.tagName === 'A' && 
                       (target.href.endsWith('.csv') || target.href.endsWith('.zip'));
    
    const isDataButton = target.classList.contains('simple-button') && 
                         target.innerText.trim() === 'Download data';

    if (isDataFile || isDataButton) {
      openModal();
    }
  });
})();