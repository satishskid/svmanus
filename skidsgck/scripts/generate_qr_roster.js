const fs = require('fs');
const PDFDocument = require('pdfkit');
const qrcode = require('qrcode');

async function generateRosterPdf(students, outputPath) {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  doc.fontSize(22).text('SKIDS EYEAR – Screening Roster', { align: 'center' });
  doc.fontSize(12).text('Scan QR to begin screening', { align: 'center' });
  doc.moveDown();

  for (const s of students) {
    const qrData = JSON.stringify({ skids: "1.0", childId: s.student_id, name: s.full_name, dob: s.date_of_birth });
    const qrBuf = await qrcode.toBuffer(qrData, { width: 70 });
    const y = doc.y;
    doc.image(qrBuf, 50, y, { width: 70 });
    doc.fontSize(14).text(`${s.full_name}`, 130, y + 5);
    doc.text(`DOB: ${s.date_of_birth}`, 130, y + 22);
    doc.text(`ID: ${s.student_id}`, 130, y + 39);
    doc.moveDown(4);
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  console.log(`✅ Roster saved to ${outputPath}`);
}

const [,, input, output] = process.argv;
if (!input || !output) {
  console.log("Usage: node generate_qr_roster.js <students.json> <output.pdf>");
  process.exit(1);
}

const students = JSON.parse(fs.readFileSync(input));
generateRosterPdf(students, output).catch(err => {
  console.error("❌ Failed to generate roster:", err);
  process.exit(1);
});