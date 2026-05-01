import * as React from 'react'
import { cn } from '../lib/utils'

export interface EmptyStateProps {
  heading: string
  subtext?: string
  className?: string
}

export function EmptyState({ heading, subtext, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-16 text-zinc-600', className)}>
      <p className="text-lg">{heading}</p>
      {subtext && <p className="text-sm mt-1">{subtext}</p>}
    </div>
  )
}
