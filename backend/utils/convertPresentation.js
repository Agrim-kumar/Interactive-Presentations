const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);
const { uploadToCloudinary } = require('../config/cloudinary');

const CONVERTED_DIR = path.join(__dirname, '..', 'converted-slides');

if (!fs.existsSync(CONVERTED_DIR)) {
  fs.mkdirSync(CONVERTED_DIR, { recursive: true });
}

// ── PPT → PDF ─────────────────────────────────────────────

async function convertPptToPdf(inputPath) {
  console.log('📄 Converting PPT/PPTX to PDF...');
  const outputDir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const pdfPath = path.join(outputDir, `${baseName}.pdf`);

  const isWindows = process.platform === 'win32';

  const commands = isWindows
    ? [
      `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
      `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
      `"C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
    ]
    : [
      `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
      `libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
      `/usr/bin/soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
      `/usr/bin/libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
    ];

  for (const command of commands) {
    try {
      console.log(`   📌 Trying: ${command.substring(0, 60)}...`);
      await execPromise(command, { timeout: 120000 });
      if (fs.existsSync(pdfPath)) {
        console.log('   ✅ PPT → PDF success!');
        return pdfPath;
      }
    } catch (e) {
      console.log(`   ⚠️ Failed: ${e.message.substring(0, 100)}`);
    }
  }

  // Fallback: try libreoffice-convert npm package
  try {
    console.log('   📌 Trying libreoffice-convert npm package...');
    const libre = require('libreoffice-convert');
    const convertAsync = util.promisify(libre.convert);
    const inputBuffer = fs.readFileSync(inputPath);
    const outputBuffer = await convertAsync(inputBuffer, '.pdf', undefined);
    fs.writeFileSync(pdfPath, outputBuffer);
    if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0) {
      console.log('   ✅ PPT → PDF success (npm package)!');
      return pdfPath;
    }
  } catch (e) {
    console.log(`   ⚠️ libreoffice-convert npm failed: ${e.message.substring(0, 100)}`);
  }

  throw new Error(
    'Cannot convert PPT/PPTX. LibreOffice is not available on the server.'
  );
}

// ── PDF → Images ──────────────────────────────────────────

function readSlideFiles(outputDir) {
  const files = fs
    .readdirSync(outputDir)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.match(/\d+/)?.[0] || 0);
      return numA - numB;
    });
  if (files.length === 0) throw new Error('No PNG files generated');
  return files.map((file) => path.join(outputDir, file));
}

async function convertWithPoppler(pdfPath, presentationId) {
  const outputDir = path.join(CONVERTED_DIR, presentationId);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPrefix = path.join(outputDir, 'slide');

  const isWindows = process.platform === 'win32';
  const commands = isWindows
    ? [
      `pdftoppm -png -r 150 "${pdfPath}" "${outputPrefix}"`,
      `"C:\\Program Files\\poppler\\bin\\pdftoppm.exe" -png -r 150 "${pdfPath}" "${outputPrefix}"`,
      `"C:\\poppler\\bin\\pdftoppm.exe" -png -r 150 "${pdfPath}" "${outputPrefix}"`,
    ]
    : [`pdftoppm -png -r 150 "${pdfPath}" "${outputPrefix}"`];

  let lastError;
  for (const cmd of commands) {
    try {
      await execPromise(cmd, { timeout: 120000 });
      return readSlideFiles(outputDir);
    } catch (e) {
      if (e.message.includes('not recognized') || e.code === 127 || e.code === 'ENOENT') {
        // Command not found, silently continue to next potential command/method
      } else {
        console.log(`   ⚠️ Poppler error: ${e.message.substring(0, 100)}`);
      }
      lastError = e;
    }
  }

  // If we get here, all poppler commands failed
  throw new Error('Poppler (pdftoppm) not found or failed. ' + (lastError ? lastError.message : ''));
}

async function convertWithGhostscript(pdfPath, presentationId) {
  const outputDir = path.join(CONVERTED_DIR, presentationId);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const isWindows = process.platform === 'win32';
  const gsCommands = isWindows ? ['gswin64c', 'gswin32c', 'gs'] : ['gs', 'ghostscript'];
  let gsCmd = null;
  for (const cmd of gsCommands) {
    try { await execPromise(`${cmd} --version`); gsCmd = cmd; break; } catch (e) { /* next */ }
  }

  if (!gsCmd) {
    // Last ditch effort: try full paths on Windows
    const fullPaths = [
      'C:\\Program Files\\gs\\gs10.03.0\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs10.04.0\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe', // Add more versions as needed
    ];
    for (const p of fullPaths) {
      if (fs.existsSync(p)) { gsCmd = `"${p}"`; break; }
    }
  }

  if (!gsCmd) throw new Error('Ghostscript not found');

  const outputPattern = path.join(outputDir, 'slide-%03d.png');
  await execPromise(`${gsCmd} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=png16m -r150 -sOutputFile="${outputPattern}" "${pdfPath}"`, { timeout: 120000 });
  return readSlideFiles(outputDir);
}

async function convertWithMutool(pdfPath, presentationId) {
  const outputDir = path.join(CONVERTED_DIR, presentationId);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPattern = path.join(outputDir, 'slide-%03d.png');
  await execPromise(`mutool convert -o "${outputPattern}" -O resolution=150 "${pdfPath}"`, { timeout: 120000 });
  return readSlideFiles(outputDir);
}

async function convertWithPdfPoppler(pdfPath, presentationId) {
  const pdfPoppler = require('pdf-poppler');
  const outputDir = path.join(CONVERTED_DIR, presentationId);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  await pdfPoppler.convert(pdfPath, {
    format: 'png',
    out_dir: outputDir,
    out_prefix: 'slide',
    scale: 1024,
  });
  return readSlideFiles(outputDir);
}

// ── Upload slides to Cloudinary ───────────────────────────

async function uploadSlidesToCloud(localFilePaths, presentationId) {
  const useCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  const slides = [];

  for (let i = 0; i < localFilePaths.length; i++) {
    const filePath = localFilePaths[i];

    if (useCloudinary) {
      try {
        const { url } = await uploadToCloudinary(
          filePath,
          `slides/${presentationId}`
        );
        slides.push({
          slideNumber: i + 1,
          imagePath: url, // Full Cloudinary URL
        });
        console.log(`   ☁️  Uploaded slide ${i + 1} to Cloudinary`);
      } catch (err) {
        console.error(`   ❌ Cloudinary upload failed for slide ${i + 1}:`, err.message);
        // Fallback to local path
        const fileName = path.basename(filePath);
        slides.push({
          slideNumber: i + 1,
          imagePath: `/converted-slides/${presentationId}/${fileName}`,
        });
      }
    } else {
      // No Cloudinary configured — use local paths (dev mode)
      const fileName = path.basename(filePath);
      slides.push({
        slideNumber: i + 1,
        imagePath: `/converted-slides/${presentationId}/${fileName}`,
      });
    }
  }

  return slides;
}

// ── MAIN ──────────────────────────────────────────────────

async function convertPresentation(filePath, presentationId) {
  const ext = path.extname(filePath).toLowerCase();
  let pdfPath = filePath;

  if (ext === '.ppt' || ext === '.pptx') {
    pdfPath = await convertPptToPdf(filePath);
  }

  console.log('🖼️  Converting PDF to slide images...');

  const methods = [
    { name: 'Poppler (pdftoppm)', fn: convertWithPoppler },
    { name: 'Ghostscript', fn: convertWithGhostscript },
    { name: 'MuPDF (mutool)', fn: convertWithMutool },
    { name: 'pdf-poppler (npm)', fn: convertWithPdfPoppler },
  ];

  for (const method of methods) {
    try {
      console.log(`   📌 Trying ${method.name}...`);
      const outputDir = path.join(CONVERTED_DIR, presentationId);
      if (fs.existsSync(outputDir)) {
        fs.readdirSync(outputDir).filter(f => f.endsWith('.png')).forEach(f => fs.unlinkSync(path.join(outputDir, f)));
      }
      const localFilePaths = await method.fn(pdfPath, presentationId);
      if (localFilePaths.length > 0) {
        console.log(`   ✅ ${localFilePaths.length} slides converted using ${method.name}`);

        // Upload to Cloudinary (or keep local paths in dev)
        const slides = await uploadSlidesToCloud(localFilePaths, presentationId);

        // Cleanup temp PPT→PDF conversion
        if ((ext === '.ppt' || ext === '.pptx') && pdfPath !== filePath) {
          try { fs.unlinkSync(pdfPath); } catch (e) { /* ignore */ }
        }

        return slides;
      }
    } catch (err) {
      console.error(`   ❌ ${method.name} failed:`, err);
    }
  }

  console.error('Final Error: No conversion methods succeeded.');
  throw new Error('PDF conversion failed. No conversion tool available on the server. Please ensure LibreOffice or Poppler is installed.');
}

module.exports = { convertPresentation };