const Resume = require('../models/Resume');
const pdfService = require('../services/pdfService');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.createResume = async (req, res) => {
  try {
    const resume = await Resume.create(req.body);
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findByPk(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const resume = await Resume.findByPk(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    await resume.update(req.body);
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByPk(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    await resume.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadPdfTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    const pdfPath = req.file.path;
    const scriptPath = path.join(__dirname, '..', '..', 'pdf_editor.py');

    const cmd = `python "${scriptPath}" extract "${pdfPath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('PDF extraction script error:', error, stderr);
        return res.status(500).json({ error: 'Failed to parse PDF layout structures.' });
      }
      try {
        const data = JSON.parse(stdout);
        if (data.error) {
          return res.status(500).json({ error: data.error });
        }
        // Map images to backend server served links
        data.pages = (data.pages || []).map(page => ({
          ...page,
          imageUrl: `http://localhost:3001/uploads/${page.image}`
        }));
        data.pdfFilename = path.basename(pdfPath);
        res.json(data);
      } catch (err) {
        console.error('JSON parse error from python stdout:', err, stdout);
        res.status(550).json({ error: 'Invalid response payload returned from PDF parser.' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generatePdf = async (req, res) => {
  try {
    const { templateId } = req.body;
    if (templateId === 'pdf-template') {
      const { pdfFilename, replacements } = req.body;
      if (!pdfFilename) {
        return res.status(400).json({ error: 'Original PDF template file is not specified.' });
      }
      const inputPath = path.join(__dirname, '..', '..', 'uploads', pdfFilename);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const outputFilename = `edited-${uniqueSuffix}.pdf`;
      const outputPath = path.join(__dirname, '..', '..', 'uploads', outputFilename);
      const replacementsJsonPath = path.join(__dirname, '..', '..', 'uploads', `replacements-${uniqueSuffix}.json`);

      // Determine profile photo layout insertion
      let imageInfo = null;
      let tempImagePath = null;

      if (req.body.basics && req.body.basics.image && req.body.pdfTemplate && req.body.pdfTemplate.showImage) {
        const imageVal = req.body.basics.image;
        let finalPath = '';
        if (imageVal.includes('/uploads/')) {
          const filename = imageVal.split('/uploads/')[1];
          finalPath = path.join(__dirname, '..', '..', 'uploads', filename);
        } else if (imageVal.startsWith('data:image/')) {
          const matches = imageVal.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const dataBuffer = Buffer.from(matches[2], 'base64');
            const tempFilename = `temp-profile-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`;
            finalPath = path.join(__dirname, '..', '..', 'uploads', tempFilename);
            fs.writeFileSync(finalPath, dataBuffer);
            tempImagePath = finalPath;
          }
        }

        if (finalPath && fs.existsSync(finalPath)) {
          const theme = req.body.theme || {};
          const pdfTemplate = req.body.pdfTemplate || {};
          imageInfo = {
            path: finalPath,
            x: pdfTemplate.imageX !== undefined ? pdfTemplate.imageX : 50,
            y: pdfTemplate.imageY !== undefined ? pdfTemplate.imageY : 50,
            page: pdfTemplate.imagePage !== undefined ? pdfTemplate.imagePage : 0,
            size: theme.profileImageSize !== undefined ? theme.profileImageSize : 96,
            shape: theme.profileImageShape || 'circle',
            border_width: theme.profileImageBorderWidth !== undefined ? theme.profileImageBorderWidth : 2,
            border_color: theme.profileImageBorderColor || '#ffffff'
          };
        }
      }

      // Write replacements payload to disk temporarily for the python script
      const payload = {
        replacements: replacements || {},
        image: imageInfo
      };
      fs.writeFileSync(replacementsJsonPath, JSON.stringify(payload, null, 2));

      const scriptPath = path.join(__dirname, '..', '..', 'pdf_editor.py');
      const cmd = `python "${scriptPath}" replace "${inputPath}" "${outputPath}" "${replacementsJsonPath}"`;

      exec(cmd, (error, stdout, stderr) => {
        // Cleanup temp config and temp image path
        try { fs.unlinkSync(replacementsJsonPath); } catch (e) {}
        if (tempImagePath) {
          try { fs.unlinkSync(tempImagePath); } catch (e) {}
        }

        if (error) {
          console.error('PDF overlay substitution failed:', error, stderr);
          return res.status(500).json({ error: 'Failed to compile edited PDF document.' });
        }

        // Send file and clean it up afterwards
        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFilename.replace(/^template-[0-9]+-/, 'resume-')}`);
        res.sendFile(outputPath, (err) => {
          try { fs.unlinkSync(outputPath); } catch (e) {}
          if (err) {
            console.error('Error sending replaced PDF file:', err);
          }
        });
      });
    } else {
      const pdfBuffer = await pdfService.generatePdf(req.body);
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
      res.send(pdfBuffer);
    }
  } catch (error) {
    console.error('PDF Generation failed:', error);
    res.status(500).json({ error: 'Failed to generate PDF document.' });
  }
};
