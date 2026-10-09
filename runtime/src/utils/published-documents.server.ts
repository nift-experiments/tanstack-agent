import {
  fetchStaticAsset,
  getCurrentHostRuntimeEnv,
} from '~/server/runtime/host.server'

// Publication ownership is explicit: an absent manifest leaves upstream intact.
// A mapped file is authoritative, including a deliberate missing-file response.
export async function fetchPublishedRepoFile(
  repo: string,
  ref: string,
  filePath: string,
): Promise<string | null | undefined> {
  const env = getCurrentHostRuntimeEnv()
  if (!env || !('ASSETS' in env)) return undefined
  const manifestResponse = await fetchStaticAsset(
    'https://nift-publication.invalid/_nift/docs-manifest.txt',
  )
  if (!manifestResponse.ok) return undefined
  const manifest: unknown = await manifestResponse.json()
  if (typeof manifest !== 'object' || manifest === null) return undefined
  const key = `${repo.toLowerCase()}@${ref}:${filePath}`
  if (!(key in manifest)) return undefined
  const assetPath = Reflect.get(manifest, key)
  if (typeof assetPath !== 'string' || !assetPath.startsWith('/_nift/docs/')) {
    throw new Error('Invalid maintained docs publication path')
  }
  const response = await fetchStaticAsset(
    new URL(assetPath, 'https://nift-publication.invalid'),
  )
  return response.ok ? response.text() : null
}
