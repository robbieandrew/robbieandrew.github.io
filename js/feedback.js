/* min-width=auto in the CSS didn't work for the transition: it collapsed too quickly. So the solution is to set the width based on the fontsize and content */
document.fonts.ready.then(() => {
  const btn = document.getElementById('tally-feedback-btn');
  btn.classList.remove('is-shrunk');
  btn.style.width = 'auto';          // temporarily release width
  const natural = Math.ceil(btn.getBoundingClientRect().width);
  btn.style.removeProperty('width'); // restore CSS control
  btn.style.setProperty('--btn-expanded-width', natural + 'px');
});

/* The feedback button appears after a couple of seconds, to draw attention, then shrinks out of the way after another few seconds so it's not too obtrusive */
window.addEventListener('DOMContentLoaded', () => {
  const feedbackBtn = document.getElementById('tally-feedback-btn');

  if (feedbackBtn) {
    // 1. Fade in the button (Mobile & Desktop) after 2 seconds
    setTimeout(() => {
      feedbackBtn.classList.add('is-visible');
      
      // 2. Trigger the shrink (Desktop only) 5 seconds later
      setTimeout(() => {
        feedbackBtn.classList.add('is-shrunk');
      }, 5000);

    }, 2000);
  }
});
