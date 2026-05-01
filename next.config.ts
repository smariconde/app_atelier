import type { NextConfig } from 'next'
import withSerwist from '@serwist/next'

const nextConfig: NextConfig = {
  transpilePackages: ['@hub/core', '@hub/db', '@hub/auth', '@hub/ui', '@hub/pwa'],
}

const withSerwistConfig = withSerwist({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwistConfig(nextConfig)
