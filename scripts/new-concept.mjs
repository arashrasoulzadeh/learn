import { mkdir, readFile, writeFile } from 'node:fs/promises';
const [category,slug]=process.argv.slice(2);
const valid=x=>typeof x==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);
if(!valid(category)||!valid(slug)){console.error('Usage: npm run new:concept -- <category> <slug>');process.exit(1);}
await readFile('src/content/categories/'+category+'.json');
const dir='src/content/concepts/'+category;await mkdir(dir,{recursive:true});
const title=slug.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
const content='---\ntitle: '+JSON.stringify(title)+'\ndescription: "Describe the concept."\ncategory: '+category+'\ndifficulty: beginner\nestimatedMinutes: 10\ntags: []\ndraft: true\n---\n\n## The problem\n\n## Mental model\n\n## Visual explanation\n\n## Practical example\n\n## Trade-offs and pitfalls\n\n## Knowledge check\n\n## Takeaway\n\n## References\n';
await writeFile(dir+'/'+slug+'.mdx',content,{flag:'wx'});
console.log('Created '+dir+'/'+slug+'.mdx (draft)');
