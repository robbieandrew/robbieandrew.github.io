(function() {
  const pageTitle = document.title || "Data Downloads";

  // 2. Icons
  const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2a9d2a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  // 3. Build citation text
  const citationText = `Andrew, R. ${new Date().getFullYear()}: "${pageTitle}", available at: ${window.location.href.split('#')[0].split('?')[0]} (accessed: ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())})`;

  // 4. Inject toast HTML
  const toastHTML = `
    <div id="citationToast" role="status" aria-live="polite">
      <div class="citation-toast-content">
        <span class="citation-toast-close">&times;</span>
        <h2 style="margin-top:0">Thanks for downloading the data!</h2>
        <p>Collating and maintaining these datasets is a <strong>significant</strong> undertaking.</p>
        <p>If you use these data in your work, <strong>please consider providing a citation:</strong></p>
        <div class="citation-box" style="position:relative; padding-right:38px;">
          <em id="toastCitationText">${citationText}</em>
          <button id="toastCopyBtn" title="Copy to clipboard" style="position:absolute;top:8px;right:8px;background:none;border:1px solid #bbb;border-radius:4px;cursor:pointer;padding:3px 5px;display:flex;align-items:center;justify-content:center;color:#555;transition:background 0.15s,color 0.15s;" onmouseover="this.style.background='#e8e8e8'" onmouseout="this.style.background='none'"></button>
        </div>
        <p>Questions? Feedback? Reach out via the <a href="https://forms.gle/jeuyvoeXqBQMnsGX8">contact form</a>.</p>
        <div style="text-align: center; margin-top: 20px;">
          <button class="pure-button pure-button-primary close-toast-btn">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', toastHTML);

  const toast = document.getElementById('citationToast');

  // 5. Show / hide logic
  const showToast = () => toast.classList.add('toast-visible');
  const hideToast = () => toast.classList.remove('toast-visible');

  // 6. Close elements (× and Close button)
  toast.querySelector('.citation-toast-close').addEventListener('click', hideToast);
  toast.querySelector('.close-toast-btn').addEventListener('click', hideToast);

  // 7. Copy citation
  const copyBtn = document.getElementById('toastCopyBtn');
  copyBtn.innerHTML = ICON_COPY;
  copyBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(citationText).then(() => {
      copyBtn.innerHTML = ICON_CHECK;
      copyBtn.style.borderColor = '#2a9d2a';
      setTimeout(() => {
        copyBtn.innerHTML = ICON_COPY;
        copyBtn.style.borderColor = '#bbb';
      }, 2000);
    });
  });

  // 8. Intercept data download clicks
  document.addEventListener('click', function(event) {
    const target = event.target;

    const isDataFile = target.tagName === 'A' &&
                       (target.href.endsWith('.csv') || target.href.endsWith('.zip'));

    const isDataButton = target.classList.contains('simple-button') &&
                         target.innerText.trim() === 'Download data';

    if (isDataFile || isDataButton) {
      showToast();
    }
  });
})();