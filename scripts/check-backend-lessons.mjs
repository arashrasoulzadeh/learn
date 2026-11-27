import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const slugs=['process-thread','stack-heap','async-await','event-loop','api-routing','middleware','rest-api','authentication','authorization','jwt'];
const root='src/content/concepts/software-engineering';
const files=readdirSync(root).filter(name=>name.endsWith('.mdx')&&/^learningPath: backend-basics$/m.test(readFileSync(root+'/'+name,'utf8')));
assert.equal(files.length,10);
let scenarios=0,steps=0;
for(let i=0;i<slugs.length;i++){
 const slug=slugs[i],mdx=readFileSync(root+'/'+slug+'.mdx','utf8');
 assert.match(mdx,new RegExp('^order: '+(i+11)+'$','m'));assert.match(mdx,/<BackendLab lesson=\{lesson\} client:load/);
 assert.doesNotMatch(mdx,/^draft: true$/m);
 const {default:l}=await import('../src/components/learning/backend/'+slug+'.ts');
 assert.equal(l.slug,slug);assert.equal(l.order,i+11);
 assert.ok(l.teaching.goal&&l.teaching.terms.length>=3&&l.teaching.practice.hint);
 for(const q of [l.quiz,l.teaching.practice])assert.ok(q.question&&q.options.length===3&&new Set(q.options).size===3&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length&&q.explanation);
 assert.ok(l.field.task&&l.field.observe&&l.field.limit);
 assert.equal(l.field.next?.slug,slugs[i+1]??'sql-nosql');
 if(l.field.next)assert.equal(l.field.next.category,i===slugs.length-1?'databases':'software-engineering');
 assert.ok(l.references.length>=2&&l.references.every(r=>r.label&&r.url.startsWith('https://')));
 assert.ok(l.actors.length>=2&&l.actors.length<=5);
 assert.ok(l.visual.title&&l.visual.context&&l.visual.labels.length===3);
 assert.ok(l.scenarios.length>=3&&l.scenarios.some(s=>s.edgeCase));
 assert.equal(new Set(l.scenarios.map(s=>s.id)).size,l.scenarios.length);
 for(const scenario of l.scenarios){
  scenarios++;assert.ok(scenario.label&&scenario.example&&scenario.prediction&&scenario.steps.length>=2);
  const actors=scenario.actors??l.actors,edges=scenario.edges??l.edges;
  assert.ok(actors.length>=2&&actors.length<=5);
  assert.ok(edges.every(([a,b])=>Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&a<actors.length&&b<actors.length));
  for(const s of scenario.steps){
   steps++;assert.ok(s.name&&s.short&&s.detail&&s.explanation&&s.result&&s.packet&&s.input&&s.output,slug+' missing explanation');
   assert.ok(s.diagnostic&&s.flightLabels?.length===Math.max(1,s.route.length-1)*(s.roundTrip?2:1)&&s.flightLabels.every(v=>v.length>0),slug+' missing per-hop messages and diagnostics');
   assert.ok(s.state.length===3&&s.state.every(v=>typeof v==='string'&&v.length));
   assert.ok(s.route.length&&s.route.every(n=>Number.isInteger(n)&&n>=0&&n<actors.length));
   for(let j=1;j<s.route.length;j++){const a=s.route[j-1],b=s.route[j];assert.ok(edges.some(([x,y])=>x===a&&y===b||x===b&&y===a),slug+' disconnected route');}
  }
 }
}
console.log('Level two audit passed: 10 lessons, '+scenarios+' scenarios, '+steps+' stages.');
