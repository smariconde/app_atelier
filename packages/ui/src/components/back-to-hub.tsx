import { ArrowLeft, LayoutGrid } from 'lucide-react'

const domain = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000'

export function BackToHub() {
  return (
    <div className="hide-in-standalone sticky top-0 z-10 pb-3 pt-1 bg-zinc-950">
      <a
        href={`//${domain}`}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <LayoutGrid size={14} />
        <ArrowLeft size={12} />
        <span>Hub</span>
      </a>
    </div>
  )
}
