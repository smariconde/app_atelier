'use client'

import * as React from 'react'

export interface DeleteButtonProps {
  formAction: () => void
  confirmMessage?: string
  label?: string
}

export function DeleteButton({
  formAction,
  confirmMessage = 'Are you sure?',
  label = 'Delete',
}: DeleteButtonProps) {
  return (
    <form action={formAction}>
      <button
        type="submit"
        className="text-red-500 hover:text-red-400 text-sm transition-colors"
        onClick={(e) => {
          if (!confirm(confirmMessage)) e.preventDefault()
        }}
      >
        {label}
      </button>
    </form>
  )
}
