/**
 * Parse a QR code string into a contact object.
 * Supports vCard format and plain JSON payloads.
 * @param {string} raw - Raw QR code string
 * @returns {{ name: string, title: string, email: string } | null}
 */
export function parseQR(raw) {
  if (!raw || typeof raw !== 'string') return null

  const trimmed = raw.trim()

  // vCard format
  if (trimmed.toUpperCase().startsWith('BEGIN:VCARD')) {
    return parseVCard(trimmed)
  }

  // JSON format
  if (trimmed.startsWith('{')) {
    return parseJSON(trimmed)
  }

  return null
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
      // handles EMAIL:, EMAIL;TYPE=...:, etc.
      email = line.slice(line.lastIndexOf(':') + 1).trim()
    } else if (upper.startsWith('N:') && !name) {
      // fallback: reconstruct from N field (Last;First;Middle;Prefix;Suffix)
      const parts = line.slice(2).split(';')
      const last = parts[0] || ''
      const first = parts[1] || ''
      name = [first, last].filter(Boolean).join(' ')
    }
  }

  if (!name && !email) return null
  return { name, title, email }
}

function parseJSON(raw) {
  try {
    const obj = JSON.parse(raw)
    const name = obj.name || obj.fullName || obj.full_name || ''
    const title = obj.title || obj.jobTitle || obj.job_title || obj.position || ''
    const email = obj.email || obj.emailAddress || obj.email_address || ''
    if (!name && !email) return null
    return { name, title, email }
  } catch {
    return null
  }
}
