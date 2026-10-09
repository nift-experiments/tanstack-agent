import type { SiteMarkdownDocument } from './markdown/processor'

export const documentProjectionPrefix = 'NIFT_TANSTACK_DOCUMENT_V1\n'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Maintained, trusted content has the same HTML capability as upstream Markdown.
// Validate its document envelope before passing it to retained component code.
function isDocument(value: unknown): value is SiteMarkdownDocument {
  return (
    isRecord(value) &&
    value.type === 'root' &&
    Array.isArray(value.children) &&
    Array.isArray(value.headings) &&
    value.children.every(
      (node: unknown) => isRecord(node) && typeof node.type === 'string',
    ) &&
    value.headings.every(
      (heading: unknown) =>
        isRecord(heading) &&
        typeof heading.id === 'string' &&
        typeof heading.text === 'string' &&
        typeof heading.level === 'number',
    )
  )
}

export function readDocumentProjection(content: string) {
  if (!content.startsWith(documentProjectionPrefix)) return undefined
  const value: unknown = JSON.parse(
    content.slice(documentProjectionPrefix.length),
  )
  if (
    !isRecord(value) ||
    !isDocument(value.document) ||
    !Array.isArray(value.frameworks) ||
    !value.frameworks.every(
      (framework: unknown) => typeof framework === 'string',
    ) ||
    typeof value.downloadMarkdown !== 'string'
  ) {
    throw new Error('Invalid maintained TanStack document projection')
  }
  return {
    document: value.document,
    frameworks: value.frameworks.filter(
      (framework): framework is string => typeof framework === 'string',
    ),
    downloadMarkdown: value.downloadMarkdown,
  }
}
