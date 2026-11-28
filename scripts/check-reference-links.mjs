import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const references=new Map();
async function scan(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    if(entry.isDirectory()){await scan(path);continue;}
    if(!/\.(mdx|tsx|ts|astro)$/.test(path))continue;
    const source=await readFile(path,'utf8');
    // Match authored reference links, not protocol examples or test addresses.
    const re=/(?:\]\(|\burl\s*:\s*["']|["']url["']\s*:\s*["'])(https:\/\/[^\s"'<>)]+)[)"']/g;
    for(const match of source.matchAll(re)){
      let url;
      try{url=new URL(match[1]);}catch{continue;}
      if(/(^|\.)(example\.(com|net|org)|example|localhost|test|invalid)$/.test(url.hostname))continue;
      if(!references.has(url.href))references.set(url.href,new Set());
      references.get(url.href).add(path);
    }
  }
}
await scan('src');
const results=[];
const entries=[...references.entries()];
let cursor=0;
async function check(){
  while(cursor<entries.length){
    const [url,paths]=entries[cursor++];
    const row={url,paths:[...paths],status:null,result:'unverified'};
    try{
      const response=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(12000),headers:{'user-agent':'Learn educational-reference QA/1.0'}});
      let status=response.status;
      if(!response.ok){
        const get=await fetch(url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(12000),headers:{'user-agent':'Learn educational-reference QA/1.0','range':'bytes=0-2047'}});
        status=get.status;
        await get.body?.cancel();
      }
      row.status=status;
      row.result=status>=200&&status<300?'ok':status===404||status===410?'broken':'unverified';
    }catch(error){row.error=String(error);}
    results.push(row);
  }
}
await Promise.all(Array.from({length:6},check));
results.sort((a,b)=>a.url.localeCompare(b.url));
const counts={ok:0,broken:0,unverified:0};for(const row of results)counts[row.result]++;
await mkdir('qa-reports',{recursive:true});await writeFile('qa-reports/references.json',JSON.stringify({counts,results},null,2));
console.log('Reference URL audit:',JSON.stringify(counts));
for(const r of results.filter(x=>x.result!=='ok'))console.log(r.result,r.status,r.url);
if(counts.broken)process.exitCode=1;
