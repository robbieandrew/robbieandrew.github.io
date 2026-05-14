
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

        <div class="citation-box" style="position:relative; padding-right:38px;">
          <em id="citationText">Andrew, R. ${new Date().getFullYear()}: "${pageTitle}", available at: ${window.location.href.split('#')[0].split('?')[0]} (accessed: ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())})</em>
          <button id="copyCitationBtn" title="Copy to clipboard" style="position:absolute;top:8px;right:8px;background:none;border:1px solid #bbb;border-radius:4px;cursor:pointer;padding:3px 5px;display:flex;align-items:center;justify-content:center;color:#555;transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#e8e8e8'" onmouseout="this.style.background='none'"></button>
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

  // 4. Copy citation to clipboard
  const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2a9d2a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  const copyBtn = document.getElementById('copyCitationBtn');
  copyBtn.innerHTML = ICON_COPY;
  copyBtn.addEventListener('click', function() {
    const text = document.getElementById('citationText').innerText;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.innerHTML = ICON_CHECK;
      copyBtn.style.borderColor = '#2a9d2a';
      setTimeout(() => {
        copyBtn.innerHTML = ICON_COPY;
        copyBtn.style.borderColor = '#bbb';
      }, 2000);
    });
  });

// 5. Global Interceptor specifically for Data Downloads
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