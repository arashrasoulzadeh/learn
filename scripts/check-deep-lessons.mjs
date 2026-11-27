import assert from 'node:assert/strict';
import {snapshot} from '../src/components/learning/deep/types.ts';
const root='src/components/learning/deep/';
const files=['networkA','networkB','backendA','backendB','dataA','dataB'];
const lessons=[];
for(const name of files){
 const mod=await import('../'+root+name+'.ts');lessons.push(...mod[name]);
}
const slugs=['http-request','dns','ip-port','tcp','udp','tls-https','http-methods','http-status-codes','cookies-sessions','websocket','process-thread','stack-heap','async-await','event-loop','api-routing','middleware','rest-api','authentication','authorization','jwt','sql-nosql','database-index','b-tree','transactions-acid','database-locking','connection-pooling','caching','cache-invalidation','replication','sharding'];
assert.deepEqual(lessons.map(l=>l.slug),slugs);
let events=0,cases=0;
for(const l of lessons){
 const fields=Object.keys(l.fields);
 assert.ok(l.title&&l.question&&l.assumptions&&l.code&&l.diagnose&&l.tradeoff&&l.sources.length>=1);
 assert.ok(l.sources.every(s=>s.label&&s.url.startsWith('https://')));
 assert.ok(l.lanes.length>=2&&l.lanes.length<=4&&new Set(l.lanes).size===l.lanes.length);
 assert.ok(fields.length>=4&&fields.length<=6);
 assert.ok(l.cases.length>=2&&new Set(l.cases.map(c=>c.id)).size===l.cases.length);
 for(const c of l.cases){
  cases++;
  assert.equal(Object.keys(c.initial).sort().join(','),fields.sort().join(','));
  assert.ok(c.verdict&&c.events.length>=4);
  let prev=-1;
  for(const ev of c.events){
   events++;assert.ok(Number.isFinite(ev.at)&&ev.at>=prev);prev=ev.at;
   assert.ok(Number.isInteger(ev.lane)&&ev.lane>=0&&ev.lane<l.lanes.length);
   if(ev.to!==undefined)assert.ok(Number.isInteger(ev.to)&&ev.to>=0&&ev.to<l.lanes.length);
   assert.ok(ev.name&&ev.wire&&ev.why&&Object.keys(ev.patch).length>0);
   for(const [key,value] of Object.entries(ev.patch))assert.ok(fields.includes(key)&&(typeof value==='string'||Number.isFinite(value)),l.slug+': '+key);
  }
  assert.notDeepEqual(snapshot(c,c.events.length),c.initial,l.slug+' no state change');
 }
 assert.notDeepEqual(snapshot(l.cases[0],l.cases[0].events.length),snapshot(l.cases[1],l.cases[1].events.length),l.slug+' no comparison');
}
console.log('Advanced engineering audit: '+lessons.length+' lessons, '+cases+' traces, '+events+' events.');
