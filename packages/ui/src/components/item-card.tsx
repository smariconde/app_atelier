import * as React from 'react'
import { cn } from '../lib/utils'

export interface ItemCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'li' | 'div'
}

export function ItemCard({
  as: Tag = 'li',
  className,
  children,
  ...props
}: ItemCardProps) {
  return (
    <Tag
      className={cn(
        'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 transition-colors',
        className
      )}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  )
}
