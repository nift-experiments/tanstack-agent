import {createProofWorker} from './proof-worker.mjs';
const worker=await createProofWorker(Number(process.argv[2]||4022));console.log('PROOF_READY');
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{await worker.dispose();process.exit(0)});
