// Generated state integrity: accidental valid-JSON corruption must also invalidate caches.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export function readState(file){try{const bytes=fs.readFileSync(file);if(fs.readFileSync(file+'.sha256','utf8')!==digest(bytes))return {};return JSON.parse(bytes)}catch{return {}}}
export function writeState(file,value){const bytes=Buffer.from(JSON.stringify(value));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);fs.writeFileSync(file+'.sha256',digest(bytes))}
