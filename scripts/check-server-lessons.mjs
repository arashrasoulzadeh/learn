import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

const root='src/content/concepts/server-infrastructure';
const lessons=[
 ['load-balancing','LoadBalancingLab'],
 ['replication','ReplicationLab'],
 ['reverse-proxy','ReverseProxyLab'],
 ['horizontal-scaling','HorizontalScalingLab'],
 ['vertical-scaling','VerticalScalingLab'],
 ['health-checks','HealthChecksLab'],
 ['service-discovery','ServiceDiscoveryLab'],
 ['connection-pooling','ConnectionPoolingLab'],
 ['failover','FailoverLab'],
 ['session-affinity','SessionAffinityLab']
];
const headings=[
 '## مسئله',
 '## مدل ذهنی',
 '## آزمایش تعاملی',
 '## مثال عملی',
 '## خطاهای رایج و ملاحظات',
 '## سنجش یادگیری',
 '## جمع‌بندی',
 '## منابع'
];
const failures=[];
for(const [slug,component] of lessons){
 const path=join(root,slug+'.mdx');
 if(!existsSync(path)){failures.push(slug+': missing lesson file');continue}
 const text=readFileSync(path,'utf8');
 for(const heading of headings)if(!text.includes(heading))failures.push(slug+': missing '+heading);
 if(!text.includes(component+' client:visible'))failures.push(slug+': missing hydrated '+component);
 if(!text.includes("category: server-infrastructure"))failures.push(slug+': wrong category');
 if(/draft:\s*true/.test(text))failures.push(slug+': still draft');
 const refs=(text.match(/https:\/\//g)||[]).length;
 if(refs<2)failures.push(slug+': needs at least two authoritative references');
 const quizzes=(text.match(/<Quiz client:visible/g)||[]).length;
 if(quizzes<2)failures.push(slug+': needs at least two knowledge checks');
}
const labFile=readFileSync('src/components/learning/ServerLabs.tsx','utf8');
for(const [,component] of lessons){
 if(!labFile.includes('export function '+component+'('))failures.push(component+': missing export');
}
for(const token of [
 'GET /api/orders','ابتدا ظرفیت فیزیکی','Replication Log','lag growing +4/s','CPU 96%','/ready 503',
 '10.0.0.12:443','POOL FULL','OLD WRITER FENCED','route=app1'
]){
 if(!labFile.includes(token))failures.push('ServerLabs.tsx missing concrete teaching token: '+token);
}
if(failures.length){
 console.error('Server curriculum audit failed:');
 failures.forEach(x=>console.error(' - '+x));
 process.exit(1);
}
console.log('Server curriculum audit passed: '+lessons.length+' concrete interactive lessons.');
