import { useState, useEffect, useCallback } from 'react'
import { db } from '../db/pouchdb.js'

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
      const result = await db.allDocs({ include_docs: true, descending: true })
      const docs = result.rows.map((r) => r.doc)
      setContacts(docs)
      lsWrite(docs)
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
    const duplicate = contacts.find(
      (c) => c.email && c.email.toLowerCase() === contact.email?.toLowerCase()
    )
    if (duplicate) return { duplicate: true }

    try {
      const scannedAt = new Date().toISOString()
      await db.put({ _id: scannedAt, ...contact, scannedAt })
      await loadContacts() // re-reads PouchDB and syncs localStorage
      return { success: true }
    } catch (err) {
      console.error('PouchDB write failed, writing to localStorage only', err)
      const scannedAt = new Date().toISOString()
      const newContact = { _id: scannedAt, ...contact, scannedAt }
      const updated = [newContact, ...contacts]
      setContacts(updated)
      lsWrite(updated)
      return { success: true }
    }
  }

  async function deleteContact(contact) {
    try {
      await db.remove(contact)
      await loadContacts()
    } catch (err) {
      console.error('PouchDB delete failed, removing from localStorage only', err)
      const updated = contacts.filter((c) => c._id !== contact._id)
      setContacts(updated)
      lsWrite(updated)
    }
  }

  return { contacts, loading, addContact, deleteContact }
}
