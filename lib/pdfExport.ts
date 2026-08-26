'use client';

interface PdfExportOptions {
  filename: string;
  title: string;
  sections: { heading: string; content: string }[];
}

export function generatePdf({ filename, title, sections }: PdfExportOptions): void {
  const win = window.open('', '_blank');
  if (!win) return;

  const css = `
    @page { margin: 24mm 20mm; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .header { text-align: center; padding: 32px 0 24px; border-bottom: 2px solid #6D28D9; margin-bottom: 24px; }
    .header h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
    .header p { font-size: 13px; color: #6b7280; }
    .section { margin-bottom: 20px; page-break-inside: avoid; }
    .section h2 { font-size: 16px; font-weight: 600; color: #6D28D9; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
    .section p { font-size: 14px; color: #374151; white-space: pre-wrap; }
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb; margin-top: 32px; font-size: 12px; color: #9ca3af; }
  `;

  const sectionsHtml = sections
    .map(
      ({ heading, content }) =>
        `<div class="section"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(content)}</p></div>`
    )
    .join('');

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${css}</style></head>
<body>
  <div class="header">
    <h1>${escapeHtml(title)}</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
  ${sectionsHtml}
  <div class="footer">
    <p>${escapeHtml(title)} &mdash; StellarAid</p>
  </div>
</body>
</html>`);
  win.document.close();
  win.print();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
