'use client'

export function DeleteButton({ formAction }: { formAction: () => void }) {
  return (
    <form action={formAction}>
      <button
        type="submit"
        className="text-red-500 hover:text-red-400 text-sm transition-colors"
        onClick={(e) => {
          if (!confirm('Delete this habit and all its entries?')) e.preventDefault()
        }}
      >
        Delete
      </button>
    </form>
  )
}
