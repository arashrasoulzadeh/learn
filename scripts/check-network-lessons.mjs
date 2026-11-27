import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const slugs=['http-request','dns','ip-port','tcp','udp','tls-https','http-methods','http-status-codes','cookies-sessions','websocket'];
const root='src/content/concepts/networking';
const files=readdirSync(root).filter(name=>name.endsWith('.mdx')&&/^learningPath: web-basics$/m.test(readFileSync(root+'/'+name,'utf8')));
assert.equal(files.length,10,'Exactly ten published level-one lessons');
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
  assert.ok(l.actors.length>=2&&l.actors.length<=5);
  assert.ok(l.references.length>=2&&l.references.every(r=>r.url.startsWith('https://')));
  assert.ok(l.quiz.options.length>=3&&l.quiz.correct>=0&&l.quiz.correct<l.quiz.options.length&&l.quiz.explanation);
  assert.ok(l.scenarios.length>=2);
  assert.equal(new Set(l.scenarios.map(s=>s.id)).size,l.scenarios.length);
  for(const s of l.scenarios){
    scenarios++;assert.ok(s.label&&s.example&&s.steps.length>=2);
    for(const st of s.steps){
      steps++;assert.ok(st.name&&st.short&&st.detail&&st.result&&st.input&&st.output&&st.packet,slug+' missing teaching data');
      assert.ok(st.route.length>0&&st.route.every(n=>Number.isInteger(n)&&n>=0&&n<l.actors.length),slug+' invalid node');
      for(let j=1;j<st.route.length;j++){
        const a=st.route[j-1],b=st.route[j];
        assert.ok(l.edges.some(([x,y])=>x===a&&y===b||x===b&&y===a),slug+' disconnected route '+a+'→'+b);
      }
    }
  }
}
console.log('Level one audit passed: 10 lessons, '+scenarios+' new scenarios, '+steps+' new interactive stages.');
