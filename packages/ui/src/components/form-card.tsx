import * as React from 'react'
import { cn } from '../lib/utils'

export interface FormCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FormCard({ className, children, ...props }: FormCardProps) {
  return (
    <div
      className={cn('bg-zinc-900 rounded-xl p-4 border border-zinc-800', className)}
      {...props}
    >
      {children}
    </div>
  )
}
