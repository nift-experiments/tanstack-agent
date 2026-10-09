// Match the original browser-unavailable Node boundary, not a Node polyfill.
module.exports=new Proxy({}, {get(_target,property){if(property==='__esModule')return false;throw new Error(`Node-only Octane build adapter accessed in browser: ${String(property)}`)}})
