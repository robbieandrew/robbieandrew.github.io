document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("object[type='image/svg+xml']").forEach(obj => {
    obj.addEventListener("load", () => {
      try {
        const svgDoc = obj.contentDocument;
        if (!svgDoc) return;

        const texts = new Set();

        // 1. Get the <title> if it exists
        const titleEl = svgDoc.querySelector("title");
        if (titleEl?.textContent) {
          texts.add(titleEl.textContent.trim());
        }

        // 2. Get all <text> elements
        svgDoc.querySelectorAll("text").forEach(textEl => {
          const classList = textEl.classList;

          // Skip if has class ticklabel ytl (vertical ticks)
          if (classList.contains("ticklabel") && classList.contains("ytl")) return;

          // Skip if class starts with dp (e.g., dp1, dp2)
          for (const cls of classList) {
            if (cls.startsWith("dp")) return;
          }

          // Extract plain text (no nested tags like <a>)
          const rawText = textEl.textContent?.trim();
          if (!rawText) return;

          // Optional: filter out purely numeric or trivial values
          if (/^[\d.,%]+$/.test(rawText)) return;

          texts.add(rawText);
        });

        if (texts.size > 0) {
          const hiddenSpan = document.createElement("span");
          hiddenSpan.className = "chart-metadata";
          hiddenSpan.textContent = Array.from(texts).join("; ") + ";";
          obj.insertAdjacentElement("afterend", hiddenSpan);
        }

      } catch (e) {
        console.warn("Could not access SVG in object:", e);
      }
    });
  });
});
