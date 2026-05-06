import * as React from 'react'
import { cn } from '../lib/utils'
import { BackToHub } from './back-to-hub'

export interface AppContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'main' | 'div'
}

export function AppContainer({
  as: Tag = 'main',
  className,
  children,
  ...props
}: AppContainerProps) {
  return (
    <Tag
      className={cn('min-h-screen bg-zinc-950 p-6 max-w-2xl mx-auto', className)}
      {...props}
    >
      <BackToHub />
      {children}
    </Tag>
  )
}
