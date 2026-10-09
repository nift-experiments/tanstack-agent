"""Bounded application-only prototype; never run on accepted repositories.
Retain original Markdown/Router/Query/feedback implementation after mounting;
test whether maintained HTML can actually remain authoritative.
"""
from pathlib import Path
import sys
root=Path(sys.argv[1]).resolve()
assert 'article-publication-probe' in str(root),'Refuse to patch accepted project'
def replace(file,old,new):
 p=root/'runtime'/file;s=p.read_text();assert s.count(old)==1,(file,old,s.count(old));p.write_text(s.replace(old,new))
replace('src/utils/document-projection.ts',"    downloadMarkdown: value.downloadMarkdown,", "    downloadMarkdown: value.downloadMarkdown,\n    publicationHtmlByFramework: isRecord(value.publicationHtmlByFramework) && Object.values(value.publicationHtmlByFramework).every((html) => typeof html === 'string') ? value.publicationHtmlByFramework as Record<string,string> : undefined,")
replace('src/components/Doc.tsx',"import { parseSiteMarkdown } from '~/utils/markdown'", "import { parseSiteMarkdown } from '~/utils/markdown'\nimport {readDocumentProjection} from '~/utils/document-projection'\nimport {useCurrentUserQuery} from '~/hooks/useCurrentUser'")
replace('src/components/Doc.tsx',"  const { groups: startHostingPartnerGroups }", "  const [browserReady,setBrowserReady]=React.useState(false)\n  React.useEffect(()=>setBrowserReady(true),[])\n  const maintainedProjection=React.useMemo(()=>readDocumentProjection(content),[content])\n  const userQuery=useCurrentUserQuery()\n  const { groups: startHostingPartnerGroups }")
replace('src/components/Doc.tsx',"  const isTocVisible =", "  const htmlFramework=String(paramsFramework || userQuery.data?.lastUsedFramework || localCurrentFramework.currentFramework || 'react').toLowerCase()\n  const preRenderedHtml=browserReady ? undefined : maintainedProjection?.publicationHtmlByFramework?.[htmlFramework]\n  const isTocVisible =")
replace('src/components/Doc.tsx',"  }, [headings])", "  }, [headings,browserReady])")
replace('src/components/Doc.tsx',"          <MarkdownContent\n", "          <MarkdownContent\n            preRenderedHtml={preRenderedHtml}\n")
replace('src/components/markdown/MarkdownContent.tsx',"type MarkdownContentProps = {", "type MarkdownContentProps = {\n  preRenderedHtml?:string")
replace('src/components/markdown/MarkdownContent.tsx',"export function MarkdownContent({\n", "export function MarkdownContent({\n  preRenderedHtml,\n")
replace('src/components/markdown/MarkdownContent.tsx',"      <DocFeedbackProvider\n", "      <DocFeedbackProvider\n        preRenderedHtml={preRenderedHtml}\n")
replace('src/components/DocFeedbackProvider.tsx',"interface DocFeedbackProviderProps {", "interface DocFeedbackProviderProps {\n  preRenderedHtml?:string")
replace('src/components/DocFeedbackProvider.tsx',"export function DocFeedbackProvider({\n", "export function DocFeedbackProvider({\n  preRenderedHtml,\n")
replace('src/components/DocFeedbackProvider.tsx',"  return (\n    <div ref={containerRef} className=\"relative\">", "  if(preRenderedHtml!==undefined) return <div ref={containerRef} className=\"relative\" dangerouslySetInnerHTML={{__html:preRenderedHtml}} />\n  return (\n    <div ref={containerRef} className=\"relative\">")
print('Four application adapters patched; original interaction implementations retained.')
