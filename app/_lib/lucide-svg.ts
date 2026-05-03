import { createElement } from 'react'
import type { ReactElement } from 'react'
import fs from 'fs'
import path from 'path'

const cache = new Map<string, Array<[string, Record<string, unknown>]> | null>()

/**
 * Reads the Lucide icon ESM file, extracts the iconNode array via a mock
 * createLucideIcon, and returns a plain <svg> ReactElement Satori can render.
 * Satori cannot call forwardRef components — this bypasses them entirely.
 */
export function getLucideElement(
  iconName: string,
  color: string,
  size: number,
  strokeWidth = 2,
): ReactElement | null {
  let iconNode = cache.get(iconName)

  if (iconNode === undefined) {
    const filePath = path.join(
      process.cwd(),
      'node_modules/lucide-react/dist/esm/icons',
      `${iconName}.js`,
    )
    try {
      const source = fs.readFileSync(filePath, 'utf-8')
      const stripped = source
        .split('\n')
        .filter((line) => !line.startsWith('import ') && !line.startsWith('export '))
        .join('\n')

      let captured: Array<[string, Record<string, unknown>]> | null = null
      const captureFn = (_: string, nodes: Array<[string, Record<string, unknown>]>) => {
        captured = nodes
        return null
      }
      // eslint-disable-next-line no-new-func
      new Function('createLucideIcon', stripped)(captureFn)
      iconNode = captured
    } catch {
      iconNode = null
    }
    cache.set(iconName, iconNode)
  }

  if (!iconNode) return null

  return createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
  )
}
