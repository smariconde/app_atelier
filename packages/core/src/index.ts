export { defineManifest } from './manifest'
export type { AppManifest } from './manifest'

export function buildAppUrl(subdomain: string, domain: string): string {
  const protocol = domain.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${subdomain}.${domain}`
}
