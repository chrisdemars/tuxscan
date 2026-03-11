import PouchDB from 'pouchdb-browser'

export const db = new PouchDB('tuxscan-contacts')

/**
 * Save a scanned contact to PouchDB.
 * _id is prefixed with 'contact_' + ISO timestamp so allDocs returns
 * contacts in chronological order and non-contact docs are excluded.
 *
 * @param {{ name: string, title: string, email: string, rawQR?: string }} contact
 * @returns {Promise<{ id: string, rev: string }>}
 */
export async function dbSaveContact(contact) {
  const scannedAt = new Date().toISOString()
  const doc = {
    _id: `contact_${scannedAt}`,
    name: contact.name || '',
    title: contact.title || '',
    email: contact.email || '',
    rawQR: contact.rawQR || '',
    scannedAt,
  }
  const result = await db.put(doc)
  return result
}

/**
 * Load all contacts from PouchDB, newest first.
 *
 * @returns {Promise<Array>}
 */
export async function dbGetAllContacts() {
  const result = await db.allDocs({
    include_docs: true,
    startkey: 'contact_\uffff',
    endkey: 'contact_',
    descending: true,
  })
  return result.rows.map((r) => r.doc)
}

/**
 * Delete a contact document from PouchDB.
 * Requires the full doc (with _id and _rev) as returned by dbGetAllContacts.
 *
 * @param {{ _id: string, _rev: string }} doc
 * @returns {Promise<void>}
 */
export async function dbDeleteContact(doc) {
  await db.remove(doc)
}

/**
 * Check if a contact with the given email already exists.
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function dbContactExists(email) {
  if (!email) return false
  const contacts = await dbGetAllContacts()
  return contacts.some((c) => c.email?.toLowerCase() === email.toLowerCase())
}
