import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputImagePath = path.resolve('public/assets/aistudio/image_ac27ef06.png');
const publicDir = path.resolve('public');

async function generateIcons() {
  if (!fs.existsSync(inputImagePath)) {
    console.error('Source image not found:', inputImagePath);
    process.exit(1);
  }

  console.log('Generating PWA icons from:', inputImagePath);

  // Copy full-res logo for UI use
  await sharp(inputImagePath)
    .resize(800, 800, { fit: 'inside' })
    .png()
    .toFile(path.join(publicDir, 'nexora-logo.png'));
  console.log('Generated nexora-logo.png');

  // 192x192 standard icon
  await sharp(inputImagePath)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 512x512 standard icon
  await sharp(inputImagePath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 180x180 Apple Touch Icon (iOS Safari requires solid background or crisp fill)
  await sharp(inputImagePath)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Favicon 32x32 and 64x64
  await sharp(inputImagePath)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  await sharp(inputImagePath)
    .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.png & favicon.ico');

  // Maskable 512x512 icon:
  // Must maintain safe-zone padding (center scaled to ~80% of canvas with background)
  // Background matches the light sky/white/pink theme of the logo
  const innerSize = Math.round(512 * 0.78); // ~400px
  const innerResized = await sharp(inputImagePath)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 } // Crisp clean white background matching PWA background_color
    }
  })
    .composite([
      {
        input: innerResized,
        top: Math.round((512 - innerSize) / 2),
        left: Math.round((512 - innerSize) / 2)
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
