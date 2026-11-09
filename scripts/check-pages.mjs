import assert from 'node:assert/strict';
import { ensureWorkflowPages } from './configure-pages.mjs';
const options = { repository:'example/bday', token:'workflow-token' };
const response = (data, status=200) => ({ ok:status<400, status, json:async()=>data });
let calls=0;
assert.equal(await ensureWorkflowPages({...options,request:async()=>{calls++;return response({build_type:'workflow'});}}), 'already-configured');
assert.equal(calls,1);
await assert.rejects(ensureWorkflowPages({...options,request:async()=>response({build_type:'legacy'})}), /regular GITHUB_TOKEN cannot change/);
await assert.rejects(ensureWorkflowPages({...options,request:async()=>response(null,404)}), /not enabled/);
const methods=[];
assert.equal(await ensureWorkflowPages({...options,adminToken:'admin-token',request:async(_url,init)=>{
 methods.push(init.method||'GET');
 assert.equal(init.headers.Authorization,'Bearer admin-token');
 if(init.method==='PUT'){assert.deepEqual(JSON.parse(init.body),{build_type:'workflow'});return response(null,204);}
 return response({build_type:methods.length===1?'legacy':'workflow'});
}}),'switched-to-workflow');
assert.deepEqual(methods,['GET','PUT','GET']);
await assert.rejects(ensureWorkflowPages({...options,adminToken:'restricted',request:async(_url,init)=>init.method?response(null,403):response({build_type:'legacy'})}),/HTTP 403/);
console.log('Passed: Pages source detection, admin-token migration, permission errors, verification.');
