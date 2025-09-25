#!/usr/bin/env node

/**
 * PWA Icon Generator for She&Her
 * Creates placeholder icons for the PWA
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon
const createIconSVG = (size, backgroundColor, textColor) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${backgroundColor}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="${size * 0.4}" fill="${textColor}">🤖</text>
</svg>`;
};

// Create icon files
const sizes = [192, 512];
const backgroundColor = '#ec4899'; // Pink theme color
const textColor = '#ffffff';

sizes.forEach(size => {
  const svgContent = createIconSVG(size, backgroundColor, textColor);
  const filename = `icon-${size}x${size}.png`;

  // For now, we'll create SVG files instead of PNG
  // In production, you'd convert these to PNG using a tool like sharp or ImageMagick
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgPath = path.join(__dirname, 'public', svgFilename);

  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created ${svgFilename}`);
});

// Create favicon
const faviconSVG = createIconSVG(32, backgroundColor, textColor);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSVG);
console.log('✅ Created favicon.svg');

// Create PWA screenshots (placeholder)
const createScreenshotSVG = (width, height, filename) => {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f0f9ff"/>
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="10" fill="white" stroke="#e0e7ff" stroke-width="2"/>
  <text x="${width/2}" y="${height/2}" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">She&Her PWA Screenshot</text>
  <text x="${width/2}" y="${height/2 + 30}" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">${filename}</text>
</svg>`;
};

const screenshots = [
  { name: 'screenshot-wide', width: 1280, height: 720 },
  { name: 'screenshot-narrow', width: 640, height: 1136 }
];

screenshots.forEach(screenshot => {
  const svgContent = createScreenshotSVG(screenshot.width, screenshot.height, screenshot.name);
  const filename = `${screenshot.name}.svg`;
  const filepath = path.join(__dirname, 'public', filename);
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Created ${filename}`);
});

// Create browserconfig.xml for Microsoft tiles
const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icon-192x192.png"/>
            <TileColor>#ec4899</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

fs.writeFileSync(path.join(__dirname, 'public', 'browserconfig.xml'), browserconfig);
console.log('✅ Created browserconfig.xml');

// Update manifest.json to use SVG icons temporarily
const manifestPath = path.join(__dirname, 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Update icons to use SVG for now
  manifest.icons = manifest.icons.map(icon => ({
    ...icon,
    src: icon.src.replace('.png', '.svg'),
    type: 'image/svg+xml'
  }));

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Updated manifest.json to use SVG icons');
}

console.log('\n🎉 PWA icons and assets created successfully!');
console.log('📝 Note: For production, convert SVG icons to PNG format using:');
console.log('   npm install -g sharp');
console.log('   sharp -i icon-192x192.svg -o icon-192x192.png');
console.log('   sharp -i icon-512x512.svg -o icon-512x512.png');
