/**
 * Parse a QR code string into a contact object.
 * Supports vCard, MECARD, JSON, and plain-text fallback.
 * @param {string} raw - Raw QR code string
 * @returns {{ name: string, title: string, email: string } | null}
 */
export function parseQR(raw) {
  if (!raw || typeof raw !== 'string') return null

  const trimmed = raw.trim()

  if (trimmed.toUpperCase().startsWith('BEGIN:VCARD')) return parseVCard(trimmed)
  if (trimmed.toUpperCase().startsWith('MECARD:')) return parseMecard(trimmed)
  if (trimmed.startsWith('{')) return parseJSON(trimmed)

  // Plain-text fallback — capture whatever we can
  return parsePlainText(trimmed)
}

function parseVCard(raw) {
  const lines = raw.split(/\r?\n/)
  let name = ''
  let title = ''
  let email = ''

  for (const line of lines) {
    const upper = line.toUpperCase()
    if (upper.startsWith('FN:')) {
      name = line.slice(line.indexOf(':') + 1).trim()
    } else if (upper.startsWith('TITLE:')) {
      title = line.slice(line.indexOf(':') + 1).trim()
    } else if (upper.startsWith('EMAIL') && upper.includes(':')) {
      email = line.slice(line.lastIndexOf(':') + 1).trim()
    } else if (upper.startsWith('N:') && !name) {
      const parts = line.slice(2).split(';')
      const last = parts[0] || ''
      const first = parts[1] || ''
      name = [first, last].filter(Boolean).join(' ')
    }
  }

  if (!name && !email) return null
  return { name, title, email }
}

// MECARD:N:Last,First;EMAIL:email;ORG:org;TEL:phone;;
function parseMecard(raw) {
  const body = raw.slice(raw.indexOf(':') + 1)
  const fields = {}

  body.split(';').forEach((part) => {
    const idx = part.indexOf(':')
    if (idx === -1) return
    const key = part.slice(0, idx).toUpperCase().trim()
    const val = part.slice(idx + 1).trim()
    if (key && val) fields[key] = val
  })

  let name = ''
  if (fields['N']) {
    const parts = fields['N'].split(',')
    const last = parts[0] || ''
    const first = parts[1] || ''
    name = [first, last].filter(Boolean).join(' ')
  }

  const title = fields['ORG'] || ''
  const email = fields['EMAIL'] || ''

  if (!name && !email) return null
  return { name, title, email }
}

function parseJSON(raw) {
  try {
    const obj = JSON.parse(raw)
    const name = obj.name || obj.fullName || obj.full_name || ''
    const title = obj.title || obj.jobTitle || obj.job_title || obj.position || obj.org || ''
    const email = obj.email || obj.emailAddress || obj.email_address || ''
    if (!name && !email) return null
    return { name, title, email }
  } catch {
    return null
  }
}

// Last-resort: extract email via regex, use remaining text as name
function parsePlainText(raw) {
  const emailMatch = raw.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)
  const email = emailMatch ? emailMatch[0] : ''

  // Remove the email from the text and use what's left as a name hint
  const remainder = raw.replace(email, '').replace(/\s+/g, ' ').trim()
  // Only use remainder as name if it looks like a name (not a URL or long blob)
  const name = remainder.length > 0 && remainder.length < 60 && !remainder.includes('http')
    ? remainder
    : ''

  if (!name && !email) return null
  return { name, title: '', email }
}
