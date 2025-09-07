function downloadSVGasPDF(svgObject) {
  try {
    const svg = svgObject.contentDocument.querySelector('svg');

    // Clone so we can safely manipulate
    const clonedSvg = svg.cloneNode(true);
    clonedSvg.querySelectorAll('foreignObject').forEach(fo => fo.remove());

    const { jsPDF } = window.jspdf;

    // Determine dimensions from viewBox or width/height attributes
    let width, height;

    if (svg.hasAttribute("viewBox")) {
      const viewBox = svg.getAttribute("viewBox").split(/\s+|,/).map(Number);
      width = viewBox[2];
      height = viewBox[3];
    } else if (svg.hasAttribute("width") && svg.hasAttribute("height")) {
      width = parseFloat(svg.getAttribute("width"));
      height = parseFloat(svg.getAttribute("height"));
    } else {
      // fallback to rendered size
      const rect = svg.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }

    // Create PDF with same size as SVG
    const pdf = new jsPDF({
      orientation: width > height ? 'l' : 'p',
      unit: 'pt',
      format: [width, height]
    });

    // Render directly into PDF
    svg2pdf(clonedSvg, pdf, {
      x: 0,
      y: 0,
      width: width,
      height: height
    });

    // Save
    pdf.save(`${svgObject.getAttribute('data').split('/').pop().replace('.svg', '')}.pdf`);
  } catch (error) {
    console.warn("Error exporting SVG to vector PDF", error);
  }
}
