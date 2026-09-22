/*
  pdf-tools.js
  ---------------------------------------------------------------
  Text -> PDF and Image -> PDF.
  Approach: Bengali script needs a font that jsPDF doesn't ship
  with, so instead of embedding a font we render the styled content
  in the browser (which already has the Google Fonts loaded) and
  rasterize it with html2canvas, then place that image into a
  jsPDF document. This keeps every style (fonts, colours, borders,
  decorations) pixel-accurate on the page, and paginates long text
  by slicing the tall canvas into page-height strips.
*/
(function () {
  const { jsPDF } = window.jspdf;

  async function canvasFromNode(node, scale = 2) {
    return html2canvas(node, { scale, backgroundColor: null, useCORS: true });
  }

  // Slice one tall canvas into A4-ratio page images and drop them into a PDF.
  async function paginateCanvasToPdf(sourceCanvas, { orientation = 'p', marginMM = 10 } = {}) {
    const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth() - marginMM * 2;
    const pageH = pdf.internal.pageSize.getHeight() - marginMM * 2;

    const pxPerMM = sourceCanvas.width / pageW;
    const pageHeightPx = Math.floor(pageH * pxPerMM);

    let renderedPx = 0;
    let first = true;
    while (renderedPx < sourceCanvas.height) {
      const sliceHeight = Math.min(pageHeightPx, sourceCanvas.height - renderedPx);
      const slice = document.createElement('canvas');
      slice.width = sourceCanvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext('2d');
      ctx.drawImage(
        sourceCanvas,
        0, renderedPx, sourceCanvas.width, sliceHeight,
        0, 0, sourceCanvas.width, sliceHeight
      );
      const imgData = slice.toDataURL('image/jpeg', 0.95);
      const imgHmm = sliceHeight / pxPerMM;
      if (!first) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', marginMM, marginMM, pageW, imgHmm);
      first = false;
      renderedPx += sliceHeight;
    }
    return pdf;
  }

  // ---- Public: Text -> styled, paginated PDF -----------------------------
  window.KobitaPDF = window.KobitaPDF || {};
  window.KobitaPDF.textToPdf = async function (node, filename) {
    const canvas = await canvasFromNode(node, 2);
    const pdf = await paginateCanvasToPdf(canvas, { marginMM: 0 });
    pdf.save(filename || 'text.pdf');
  };

  window.KobitaPDF.posterToPdf = async function (node, filename) {
    const canvas = await canvasFromNode(node, 2.5);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename || 'poster.pdf');
  };

  window.KobitaPDF.posterToPng = async function (node, filename) {
    const canvas = await canvasFromNode(node, 3);
    const link = document.createElement('a');
    link.download = filename || 'poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ---- Public: Images -> PDF ----------------------------------------------
  // images: array of { dataUrl, width, height, caption }
  window.KobitaPDF.imagesToPdf = async function (images, opts) {
    const {
      pageSize = 'a4',
      orientation = 'auto', // auto | p | l
      marginMM = 10,
      onePerPage = true,
      captionColor = '#333333'
    } = opts || {};

    let pdf = null;
    images.forEach((img, idx) => {
      const imgOrientation = orientation === 'auto'
        ? (img.width > img.height ? 'l' : 'p')
        : orientation;

      if (!pdf) {
        pdf = new jsPDF({ orientation: imgOrientation, unit: 'mm', format: pageSize });
      } else if (onePerPage || idx > 0) {
        pdf.addPage(pageSize, imgOrientation);
      }

      const pageW = pdf.internal.pageSize.getWidth() - marginMM * 2;
      const pageH = pdf.internal.pageSize.getHeight() - marginMM * 2 - (img.caption ? 8 : 0);

      const ratio = Math.min(pageW / img.width, pageH / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = marginMM + (pageW - w) / 2;
      const y = marginMM + (pageH - h) / 2;

      pdf.addImage(img.dataUrl, 'JPEG', x, y, w, h);

      if (img.caption) {
        pdf.setTextColor(captionColor);
        pdf.setFontSize(10);
        pdf.text(img.caption, marginMM + pageW / 2, y + h + 6, { align: 'center' });
      }
    });

    pdf.save(opts.filename || 'images.pdf');
  };
})();
