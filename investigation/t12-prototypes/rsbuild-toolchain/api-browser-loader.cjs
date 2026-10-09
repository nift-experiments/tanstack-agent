module.exports=function(source){
 const match=source.match(/createFileRoute\(\s*(['"])([^'"]+)\1\s*,?\s*\)/)
 if(!match)throw Error('Expected original literal API route identity')
 if(/\b(?:beforeLoad|loader|component|head|meta)\s*:/.test(source.match(/export const Route[\s\S]*/)?.[0]??''))throw Error('Refuse to discard browser route behavior')
 return `import {createFileRoute} from '@tanstack/react-router'; export const Route=createFileRoute(${JSON.stringify(match[2])})({});`
}
