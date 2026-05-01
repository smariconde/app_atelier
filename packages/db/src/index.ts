// DB_ADAPTER controls which backend is used (sqlite | turso | postgres | mysql | d1)
export * from './schema'

export function getDb(binding?: unknown) {
  const adapter = process.env.DB_ADAPTER ?? 'sqlite'
  switch (adapter) {
    case 'turso': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getDb: fn } = require('./adapters/turso') as typeof import('./adapters/turso')
      return fn()
    }
    case 'postgres': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getDb: fn } = require('./adapters/postgres') as typeof import('./adapters/postgres')
      return fn()
    }
    case 'mysql': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getDb: fn } = require('./adapters/mysql') as typeof import('./adapters/mysql')
      return fn()
    }
    case 'd1': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getDb: fn } = require('./adapters/d1') as typeof import('./adapters/d1')
      return fn(binding as Parameters<typeof fn>[0])
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getDb: fn } = require('./adapters/sqlite') as typeof import('./adapters/sqlite')
      return fn()
    }
  }
}
