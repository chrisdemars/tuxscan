import { ContactCard } from './ContactCard.jsx'
import { EmptyState } from './EmptyState.jsx'

export function ContactList({ contacts, onDelete }) {
  if (contacts.length === 0) return <EmptyState />

  return (
    <div className="flex flex-col gap-2 px-4 pb-4">
      {contacts.map((contact) => (
        <ContactCard key={contact._id} contact={contact} onDelete={onDelete} />
      ))}
    </div>
  )
}
