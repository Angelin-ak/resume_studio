const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const templates = require('./templates');

async function generatePdf(resumeData) {
  const { templateId = 'clean-ats', theme = {}, basics = {} } = resumeData;

  // Resolve base64 image if present
  let imageBase64 = '';
  if (basics.image) {
    try {
      const filename = path.basename(basics.image);
      const filepath = path.join(__dirname, '..', '..', 'uploads', filename);
      if (fs.existsSync(filepath)) {
        const mimeType = path.extname(filepath) === '.png' ? 'image/png' : 'image/jpeg';
        imageBase64 = `data:${mimeType};base64,${fs.readFileSync(filepath).toString('base64')}`;
      }
    } catch (e) {
      console.error('Image encoding failed:', e);
    }
  }

  // Prune the data according to the section visibility configuration
  const { sectionVisibility = {} } = theme;
  const prunedData = {
    ...resumeData,
    basics: {
      ...resumeData.basics,
      summary: sectionVisibility.summary !== false ? resumeData.basics?.summary : ''
    },
    work: sectionVisibility.work !== false ? (resumeData.work || []) : [],
    education: sectionVisibility.education !== false ? (resumeData.education || []) : [],
    skills: sectionVisibility.skills !== false ? (resumeData.skills || []) : [],
    projects: sectionVisibility.projects !== false ? (resumeData.projects || []) : [],
    certifications: sectionVisibility.certifications !== false ? (resumeData.certifications || []) : [],
    references: sectionVisibility.references !== false ? (resumeData.references || []) : []
  };

  // Choose template
  let templateHtml = '';
  if (templateId === 'modern-sidebar') {
    templateHtml = templates.renderModernSidebar(prunedData, imageBase64);
  } else if (templateId === 'premium-creative') {
    templateHtml = templates.renderPremiumCreative(prunedData, imageBase64);
  } else if (templateId === 'professional-modern') {
    templateHtml = templates.renderProfessionalModern(prunedData, imageBase64);
  } else if (templateId === 'pink-maroon-modern') {
    templateHtml = templates.renderPinkMaroonModern(prunedData, imageBase64);
  } else if (templateId === 'black-minimalist-structural') {
    templateHtml = templates.renderBlackMinimalistStructural(prunedData, imageBase64);
  } else if (templateId === 'professional-modern-cv-1') {
    templateHtml = templates.renderProfessionalModernCv1(prunedData, imageBase64);
  } else if (templateId === 'black-yellow-modern-professional') {
    templateHtml = templates.renderBlackYellowModernProfessional(prunedData, imageBase64);
  } else if (templateId === 'professional-modern-uiux-designer') {
    templateHtml = templates.renderProfessionalModernUiuxDesigner(prunedData, imageBase64);
  } else {
    templateHtml = templates.renderCleanAts(prunedData, imageBase64);
  }

  const primaryColor = theme.primaryColor || (
    templateId === 'pink-maroon-modern' ? '#801f31' :
    templateId === 'professional-modern-cv-1' ? '#1C1D21' :
    templateId === 'black-yellow-modern-professional' ? '#FFB800' :
    templateId === 'professional-modern-uiux-designer' ? '#1F2E3D' :
    '#0f766e'
  );
  const secondaryColor = theme.secondaryColor || (
    templateId === 'pink-maroon-modern' ? '#801f31' :
    templateId === 'professional-modern-cv-1' ? '#E5E5E5' :
    templateId === 'black-yellow-modern-professional' ? '#333333' :
    templateId === 'professional-modern-uiux-designer' ? '#EAEFF5' :
    '#1e293b'
  );
  const textColor = theme.textColor || '#1f2937';
  const backgroundColor = theme.backgroundColor || (
    templateId === 'pink-maroon-modern' ? '#FAF4F0' :
    '#ffffff'
  );
  const fontFamily = theme.fontFamily === 'Georgia' ? 'Georgia, serif' : theme.fontFamily === 'Monospace' ? 'monospace' : theme.fontFamily === 'Montserrat' ? 'Montserrat, sans-serif' : 'sans-serif';

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Resume Print Preview</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                primary: '${primaryColor}',
                secondary: '${secondaryColor}',
                textcol: '${textColor}',
              },
              fontFamily: {
                custom: ['${fontFamily.split(',')[0]}', 'sans-serif'],
              }
            }
          }
        }
      </script>
      <style type="text/css">
        body {
          font-family: ${fontFamily};
          background-color: ${backgroundColor} !important;
          color: ${textColor} !important;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page-break-avoid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        @page {
          size: A4;
          margin: 0;
        }
        /* Custom dynamic style overrides */
        .text-gray-900 { color: ${textColor} !important; }
        .text-gray-800 { color: ${textColor} !important; opacity: 0.95; }
        .text-gray-700 { color: ${textColor} !important; opacity: 0.9; }
        .text-gray-650 { color: ${textColor} !important; opacity: 0.85; }
        .text-gray-600 { color: ${textColor} !important; opacity: 0.8; }
        .text-gray-550 { color: ${textColor} !important; opacity: 0.75; }
        .text-gray-500 { color: ${textColor} !important; opacity: 0.7; }
        .text-gray-400 { color: ${textColor} !important; opacity: 0.55; }
        
        .bg-white { background-color: ${backgroundColor} !important; }
        .bg-\\[\\#FAF4F0\\] { background-color: ${backgroundColor} !important; }
        .bg-gray-50 { opacity: 0.95; }
      </style>
    </head>
    <body>
      ${templateHtml}
    </body>
    </html>
  `;

  // Start puppeteer session
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    // Output high-quality A4 PDF with printed backgrounds
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = {
  generatePdf
};
