/**
 * Generates iOS PWA splash screens using the app icon centered on the slate-900 background.
 * Run: node scripts/generate-splashscreens.mjs
 */

import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const iconsDir = join(root, 'public', 'icons')
const splashDir = join(root, 'public', 'splash')

mkdirSync(splashDir, { recursive: true })

// Background color matching the app (slate-900)
const BG = { r: 15, g: 23, b: 42, alpha: 1 }

// Common iOS device splash screen sizes (portrait, physical pixels)
const devices = [
  { name: 'iphone-se',           w: 640,  h: 1136 },
  { name: 'iphone-8',            w: 750,  h: 1334 },
  { name: 'iphone-8-plus',       w: 1242, h: 2208 },
  { name: 'iphone-x-xs',         w: 1125, h: 2436 },
  { name: 'iphone-xr-11',        w: 828,  h: 1792 },
  { name: 'iphone-xs-max-11-pm', w: 1242, h: 2688 },
  { name: 'iphone-12-13-14-mini',w: 1080, h: 2340 },
  { name: 'iphone-12-13-14',     w: 1170, h: 2532 },
  { name: 'iphone-12-13-14-plus',w: 1284, h: 2778 },
  { name: 'iphone-14-pro',       w: 1179, h: 2556 },
  { name: 'iphone-14-pro-max',   w: 1290, h: 2796 },
  { name: 'iphone-15-pro',       w: 1179, h: 2556 },
  { name: 'iphone-15-pro-max',   w: 1290, h: 2796 },
  { name: 'ipad-mini',           w: 1536, h: 2048 },
  { name: 'ipad-air',            w: 1640, h: 2360 },
  { name: 'ipad-pro-11',         w: 1668, h: 2388 },
  { name: 'ipad-pro-12-9',       w: 2048, h: 2732 },
]

async function generateSplash(device) {
  const { name, w, h } = device

  // Icon size: ~28% of the short edge, capped at 512
  const iconSize = Math.min(Math.round(Math.min(w, h) * 0.28), 512)

  // Resize icon
  const iconBuf = await sharp(join(iconsDir, 'icon-512.png'))
    .resize(iconSize, iconSize)
    .toBuffer()

  // Center icon on background
  await sharp({
    create: { width: w, height: h, channels: 4, background: BG },
  })
    .composite([{
      input: iconBuf,
      gravity: 'center',
    }])
    .png({ compressionLevel: 9 })
    .toFile(join(splashDir, `splash-${name}.png`))

  console.log(`✓ splash-${name}.png  (${w}×${h})`)
}

async function run() {
  for (const device of devices) {
    await generateSplash(device)
  }
  console.log('\nAll splash screens generated in public/splash/')
}

run().catch(err => { console.error(err); process.exit(1) })
