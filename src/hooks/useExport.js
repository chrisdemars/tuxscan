import Papa from 'papaparse'
import emailjs from '@emailjs/browser'

export function useExport() {
  async function sendCSV(contacts, recipientEmail) {
    const csv = Papa.unparse(
      contacts.map((c) => ({
        Name: c.name,
        Title: c.title,
        Email: c.email,
        'Scanned At': new Date(c.scannedAt).toLocaleString(),
      }))
    )

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: recipientEmail,
          csv_data: csv,
          contact_count: contacts.length,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      return { success: true }
    } catch (err) {
      console.error('EmailJS failed, falling back to download', err)
      downloadCSV(csv)
      return { fallback: true }
    }
  }

  function downloadCSV(contacts) {
    const csv =
      typeof contacts === 'string'
        ? contacts
        : Papa.unparse(
            contacts.map((c) => ({
              Name: c.name,
              Title: c.title,
              Email: c.email,
              'Scanned At': new Date(c.scannedAt).toLocaleString(),
            }))
          )
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tuxscan-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { sendCSV, downloadCSV }
}
