/**
 * Parse a QR code string into a contact object.
 * Tries vCard → MECARD → JSON → plain-text email extraction → raw fallback.
 * Always returns a contact for any non-empty string.
 * @param {string} raw
 * @returns {{ name: string, title: string, email: string }}
 */
export function parseQR(raw) {
  if (!raw || typeof raw !== 'string') return null

  const trimmed = raw.trim()
  if (!trimmed) return null

  if (trimmed.toUpperCase().startsWith('BEGIN:VCARD')) return parseVCard(trimmed)
  if (trimmed.toUpperCase().startsWith('MECARD:')) return parseMecard(trimmed)
  if (trimmed.startsWith('{')) {
    const result = parseJSON(trimmed)
    if (result) return result
  }

  return parseFallback(trimmed)
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

  return { name: name || 'Unknown', title, email }
}

// MECARD:N:Last,First;EMAIL:email;ORG:org;;
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
    name = [parts[1], parts[0]].filter(Boolean).join(' ')
  }

  return {
    name: name || 'Unknown',
    title: fields['ORG'] || '',
    email: fields['EMAIL'] || '',
  }
}

function parseJSON(raw) {
  try {
    const obj = JSON.parse(raw)
    const name = obj.name || obj.fullName || obj.full_name || ''
    const title = obj.title || obj.jobTitle || obj.job_title || obj.position || obj.org || ''
    const email = obj.email || obj.emailAddress || obj.email_address || ''
    if (!name && !email) return null
    return { name: name || 'Unknown', title, email }
  } catch {
    return null
  }
}

// Extract email if present; store remaining text or raw as name
function parseFallback(raw) {
  const emailMatch = raw.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)
  const email = emailMatch ? emailMatch[0] : ''
  const remainder = raw.replace(email, '').replace(/\s+/g, ' ').trim()
  const name = remainder.length > 0 && remainder.length < 80 ? remainder : raw.slice(0, 80)
  return { name, title: '', email }
}
