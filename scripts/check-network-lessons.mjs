import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {fieldExercises} from '../src/components/learning/network/fieldExercises.ts';
const slugs=['http-request','dns','ip-port','tcp','udp','tls-https','http-methods','http-status-codes','cookies-sessions','websocket'];
const root='src/content/concepts/networking';
const files=readdirSync(root).filter(name=>name.endsWith('.mdx')&&/^learningPath: web-basics$/m.test(readFileSync(root+'/'+name,'utf8')));
assert.equal(files.length,10,'Exactly ten published level-one lessons');
assert.equal(Object.keys(fieldExercises).length,slugs.length,'Hands-on exercises for all ten lessons');
for(let i=0;i<slugs.length;i++){
  const exercise=fieldExercises[slugs[i]];
  assert.ok(exercise?.task&&exercise.observe&&exercise.limit,slugs[i]+' missing real-world observation');
  assert.equal(exercise.next?.slug,slugs[i+1]??'process-thread',slugs[i]+' broken lesson progression');
}
let scenarios=0,steps=0;
for(let i=0;i<slugs.length;i++){
  const slug=slugs[i],mdx=readFileSync(root+'/'+slug+'.mdx','utf8');
  assert.match(mdx,new RegExp('^order: '+(i+1)+'$','m'),slug+' order');
  assert.match(mdx,/^learningPath: web-basics$/m);
  assert.doesNotMatch(mdx,/^draft: true$/m);
  if(slug==='http-request'){assert.match(mdx,/<RequestLab client:load/);continue;}
  assert.match(mdx,/<NetworkLab lesson=\{lesson\} client:load/);
  const {default:l}=await import('../src/components/learning/network/'+slug+'.ts');
  assert.equal(l.slug,slug);assert.equal(l.order,i+1);
  assert.ok(l.title&&l.description&&l.pitfall&&l.takeaway);
  assert.ok(l.teaching.goal&&l.teaching.terms.length>=3&&l.teaching.practice.question&&l.teaching.practice.options.length===3&&l.teaching.practice.correct>=0&&l.teaching.practice.correct<3&&l.teaching.practice.explanation&&l.teaching.practice.hint,slug+' missing teaching outcomes and applied practice');
  assert.ok(l.visual.title&&l.visual.context&&l.visual.labels.length===3&&new Set(l.visual.labels).size===3,slug+' missing tailored visual');
  assert.ok(l.actors.length>=2&&l.actors.length<=5);
  assert.ok(l.references.length>=2&&l.references.every(r=>r.url.startsWith('https://')));
  assert.ok(l.quiz.options.length>=3&&l.quiz.correct>=0&&l.quiz.correct<l.quiz.options.length&&l.quiz.explanation);
  assert.ok(l.scenarios.length>=3&&l.scenarios.some(s=>s.edgeCase),slug+' needs selectable edge cases');
  assert.equal(new Set(l.scenarios.map(s=>s.id)).size,l.scenarios.length);
  for(const s of l.scenarios){
    scenarios++;assert.ok(s.label&&s.example&&s.steps.length>=2);
    for(const st of s.steps){
      steps++;assert.ok(st.name&&st.short&&st.detail&&st.result&&st.input&&st.output&&st.packet&&st.explanation,slug+' missing teaching data');
      assert.ok(Array.isArray(st.state)&&st.state.length===l.visual.labels.length&&st.state.every(value=>typeof value==='string'&&value.length>0),slug+' missing concrete protocol state');
      assert.ok(st.route.length>0&&st.route.every(n=>Number.isInteger(n)&&n>=0&&n<l.actors.length),slug+' invalid node');
      for(let j=1;j<st.route.length;j++){
        const a=st.route[j-1],b=st.route[j];
        assert.ok(l.edges.some(([x,y])=>x===a&&y===b||x===b&&y===a),slug+' disconnected route '+a+'→'+b);
      }
    }
  }
}
console.log('Level one audit passed: 10 lessons, '+scenarios+' new scenarios, '+steps+' new interactive stages.');
