import { useState, useEffect, useCallback } from 'react'
import { db } from '../db/pouchdb.js'

export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadContacts = useCallback(async () => {
    try {
      const result = await db.allDocs({ include_docs: true, descending: true })
      setContacts(result.rows.map((r) => r.doc))
    } catch (err) {
      console.error('Failed to load contacts', err)
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
      await loadContacts()
      return { success: true }
    } catch (err) {
      console.error('Failed to add contact', err)
      return { error: true }
    }
  }

  async function deleteContact(contact) {
    try {
      await db.remove(contact)
      await loadContacts()
    } catch (err) {
      console.error('Failed to delete contact', err)
    }
  }

  return { contacts, loading, addContact, deleteContact }
}
