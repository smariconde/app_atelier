import * as React from 'react'
import Link from 'next/link'
import { cn } from '../lib/utils'

export interface PageHeaderProps {
  title?: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = '← Back',
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-8', className)}>
      {backHref && (
        <div className="mb-4">
          <Link
            href={backHref}
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            {backLabel}
          </Link>
        </div>
      )}
      {(title || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}
            {subtitle && <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
    </header>
  )
}
