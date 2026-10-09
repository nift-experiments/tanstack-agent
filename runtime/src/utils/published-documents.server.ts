import {
  fetchStaticAsset,
  getCurrentHostRuntimeEnv,
} from '~/server/runtime/host.server'

async function readPublishedFile(
  repo: string,
  ref: string,
  filePath: string,
  category: 'files' | 'projections' | 'rawFiles',
): Promise<string | null | undefined> {
  const env = getCurrentHostRuntimeEnv()
  if (!env || !('ASSETS' in env)) return undefined
  const response = await fetchStaticAsset(
    'https://nift-publication.invalid/_nift/docs-manifest.txt',
  )
  if (!response.ok) return undefined
  const manifest: unknown = await response.json()
  if (typeof manifest !== 'object' || manifest === null) return undefined
  const key = `${repo.toLowerCase()}@${ref}:${filePath}`
  const entries: unknown = Reflect.get(manifest, category)
  // T3 publications contained projections only. Never expose them as raw files.
  const selected =
    entries === undefined && category === 'projections' ? manifest : entries
  if (typeof selected !== 'object' || selected === null || !(key in selected)) {
    if (category === 'projections') return undefined
    const roots: unknown = Reflect.get(manifest, 'roots')
    if (
      Array.isArray(roots) &&
      roots.some(
        (root: unknown) => typeof root === 'string' && key.startsWith(root),
      )
    )
      return null
    return undefined
  }
  const assetPath: unknown = Reflect.get(selected, key)
  if (typeof assetPath !== 'string' || !assetPath.startsWith('/_nift/docs/')) {
    throw new Error('Invalid maintained docs publication path')
  }
  const asset = await fetchStaticAsset(
    new URL(assetPath, 'https://nift-publication.invalid'),
  )
  return asset.ok ? asset.text() : null
}

// Raw consumers receive original bytes; page rendering alone receives projections.
export function fetchPublishedRepoFile(
  repo: string,
  ref: string,
  filePath: string,
) {
  return readPublishedFile(repo, ref, filePath, 'files')
}

export function fetchPublishedDocumentSource(
  repo: string,
  ref: string,
  filePath: string,
) {
  return readPublishedFile(repo, ref, filePath, 'projections')
}

export async function fetchPublishedDocsMetadata(
  repo: string,
  ref: string,
  docsRoot: string,
) {
  const env = getCurrentHostRuntimeEnv()
  if (!env || !('ASSETS' in env)) return undefined
  const response = await fetchStaticAsset(
    'https://nift-publication.invalid/_nift/docs-manifest.txt',
  )
  if (!response.ok) return undefined
  const manifest: unknown = await response.json()
  if (typeof manifest !== 'object' || manifest === null) return undefined
  const metadata: unknown = Reflect.get(manifest, 'metadata')
  if (typeof metadata !== 'object' || metadata === null) return undefined
  const assetPath: unknown = Reflect.get(
    metadata,
    `${repo.toLowerCase()}@${ref}:${docsRoot}`,
  )
  if (assetPath === undefined) return undefined
  if (typeof assetPath !== 'string' || !assetPath.startsWith('/_nift/docs/'))
    throw new Error('Invalid docs metadata asset')
  const asset = await fetchStaticAsset(
    new URL(assetPath, 'https://nift-publication.invalid'),
  )
  if (!asset.ok) throw new Error('Owned docs metadata asset missing')
  const value: unknown = await asset.json()
  return value
}

export async function fetchPublishedDocsTree(
  repo: string,
  ref: string,
  startingPath: string,
) {
  const env = getCurrentHostRuntimeEnv()
  if (!env || !('ASSETS' in env)) return undefined
  const response = await fetchStaticAsset(
    'https://nift-publication.invalid/_nift/docs-manifest.txt',
  )
  if (!response.ok) return undefined
  const manifest: unknown = await response.json()
  if (typeof manifest !== 'object' || manifest === null) return undefined
  const trees: unknown = Reflect.get(manifest, 'trees')
  if (typeof trees !== 'object' || trees === null) return undefined
  const prefix = `${repo.toLowerCase()}@${ref}:`
  const key = Object.keys(trees).find(
    (root) =>
      root.startsWith(prefix) &&
      (root === prefix + startingPath ||
        (prefix + startingPath).startsWith(root + '/')),
  )
  if (key === undefined) return undefined
  const assetPath: unknown = Reflect.get(trees, key)
  if (typeof assetPath !== 'string' || !assetPath.startsWith('/_nift/docs/'))
    throw new Error('Invalid docs tree asset')
  const asset = await fetchStaticAsset(
    new URL(assetPath, 'https://nift-publication.invalid'),
  )
  if (!asset.ok) throw new Error('Owned docs tree asset missing')
  const value: unknown = await asset.json()
  return value
}

export function fetchPublishedRawFile(
  repo: string,
  ref: string,
  filePath: string,
) {
  return readPublishedFile(repo, ref, filePath, 'rawFiles')
}
