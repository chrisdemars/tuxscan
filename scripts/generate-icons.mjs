/**
 * Generates PWA icons by combining the TuxCare logo with a decorative QR code.
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Read the TuxCare logo and encode as base64
const logoPath = join(root, 'scripts', 'tuxcare-logo.png')
const logoB64 = readFileSync(logoPath).toString('base64')

// Decorative QR code pattern as SVG — visually realistic, non-functional.
// Modules are 10x10 in a 21-module grid → 210px square, centered in the icon.
// Finder patterns at top-left, top-right, bottom-left corners.
// Timing patterns + random-looking data modules.
function qrModules() {
  const SIZE = 21
  // 1 = dark module, 0 = light
  // prettier-ignore
  const grid = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,0,1,1,0,1],
    [0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1,0,0,1,0],
    [1,0,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1],
    [0,1,1,0,0,1,0,1,0,0,1,0,0,1,0,0,1,1,0,0,1],
    [1,0,0,1,1,0,1,0,1,1,0,1,1,0,1,0,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,1,0,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,0,1,0,1,1,0],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,0,0,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,1,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,0,1,0,1,1,1],
  ]
  return grid
}

function buildSVG(size) {
  const bg = '#0f172a'
  const quiet = 28      // quiet zone + padding around QR (px, at 512 scale)
  const logoH = 52      // logo display height (px, at 512 scale)
  const logoW = Math.round(logoH * (270 / 62))  // maintain aspect ratio ≈ 226
  const gap = 18        // gap between QR and logo
  const modules = 21
  const qrArea = size - quiet * 2 - logoH - gap  // remaining height for QR
  const mod = Math.floor(qrArea / modules)        // px per module
  const qrSize = mod * modules
  const qrX = Math.round((size - qrSize) / 2)
  const qrY = quiet

  const grid = qrModules()
  let rects = ''
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        const x = qrX + c * mod
        const y = qrY + r * mod
        rects += `<rect x="${x}" y="${y}" width="${mod}" height="${mod}" fill="white"/>`
      }
    }
  }

  // Logo centered below QR
  const logoX = Math.round((size - logoW) / 2)
  const logoY = qrY + qrSize + gap

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  ${rects}
  <image href="data:image/png;base64,${logoB64}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}"/>
</svg>`
}

// Maskable version: larger quiet zone (10% safe area on each side = safe zone is inner 80%)
function buildMaskableSVG(size) {
  const bg = '#0f172a'
  const safe = Math.round(size * 0.15)  // 15% safe area padding
  const logoH = 40
  const logoW = Math.round(logoH * (270 / 62))
  const gap = 14
  const modules = 21
  const qrArea = size - safe * 2 - logoH - gap
  const mod = Math.floor(qrArea / modules)
  const qrSize = mod * modules
  const qrX = Math.round((size - qrSize) / 2)
  const qrY = safe

  const grid = qrModules()
  let rects = ''
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        const x = qrX + c * mod
        const y = qrY + r * mod
        rects += `<rect x="${x}" y="${y}" width="${mod}" height="${mod}" fill="white"/>`
      }
    }
  }

  const logoX = Math.round((size - logoW) / 2)
  const logoY = qrY + qrSize + gap

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  ${rects}
  <image href="data:image/png;base64,${logoB64}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}"/>
</svg>`
}

const iconsDir = join(root, 'public', 'icons')
mkdirSync(iconsDir, { recursive: true })

async function generate() {
  // 512x512
  const svg512 = buildSVG(512)
  await sharp(Buffer.from(svg512)).png().toFile(join(iconsDir, 'icon-512.png'))
  console.log('✓ icon-512.png')

  // 512x512 maskable
  const svgMask = buildMaskableSVG(512)
  await sharp(Buffer.from(svgMask)).png().toFile(join(iconsDir, 'icon-512-maskable.png'))
  console.log('✓ icon-512-maskable.png')

  // 192x192
  await sharp(join(iconsDir, 'icon-512.png')).resize(192, 192).png().toFile(join(iconsDir, 'icon-192.png'))
  console.log('✓ icon-192.png')

  console.log('\nAll icons generated in public/icons/')
}

generate().catch(err => { console.error(err); process.exit(1) })
