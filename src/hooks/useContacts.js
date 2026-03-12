import { useState, useEffect, useCallback } from 'react'
import { dbSaveContact, dbGetAllContacts, dbDeleteContact, dbContactExists, dbClearAllContacts } from '../db/pouchdb.js'

const LS_KEY = 'tuxscan_contacts'

function lsRead() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function lsWrite(contacts) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(contacts))
  } catch (err) {
    console.error('localStorage write failed', err)
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadContacts = useCallback(async () => {
    try {
      const docs = await dbGetAllContacts()
      setContacts(docs)
      lsWrite(docs) // keep localStorage mirror in sync
    } catch (err) {
      console.error('PouchDB load failed, falling back to localStorage', err)
      setContacts(lsRead())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  async function addContact(contact) {
    try {
      const exists = await dbContactExists(contact.email)
      if (exists) return { duplicate: true }

      await dbSaveContact(contact)
      await loadContacts()
      return { success: true }
    } catch (err) {
      console.error('PouchDB write failed, writing to localStorage only', err)
      // localStorage fallback so the scan is never lost
      const scannedAt = new Date().toISOString()
      const newContact = { _id: `contact_${scannedAt}`, ...contact, scannedAt }
      const updated = [newContact, ...contacts]
      setContacts(updated)
      lsWrite(updated)
      return { success: true }
    }
  }

  async function deleteContact(contact) {
    try {
      await dbDeleteContact(contact)
      await loadContacts()
    } catch (err) {
      console.error('PouchDB delete failed, removing from localStorage only', err)
      const updated = contacts.filter((c) => c._id !== contact._id)
      setContacts(updated)
      lsWrite(updated)
    }
  }

  async function clearContacts() {
    try {
      await dbClearAllContacts()
      setContacts([])
      lsWrite([])
    } catch (err) {
      console.error('PouchDB clear failed, clearing localStorage only', err)
      setContacts([])
      lsWrite([])
    }
  }

  return { contacts, loading, addContact, deleteContact, clearContacts }
}
