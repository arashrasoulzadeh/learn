import {useState} from 'react';
type Props={question:string;options:string[];correct:number;explanation:string};
export default function Quiz({question,options,correct,explanation}:Props){
  const [selected,setSelected]=useState<number|null>(null);
  let hash=2166136261;
  for(const char of question) hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
  const ordered=options.map((option,index)=>({option,index}));
  for(let i=ordered.length-1;i>0;i--){hash=(Math.imul(hash,1664525)+1013904223)>>>0;const j=hash%(i+1);[ordered[i],ordered[j]]=[ordered[j],ordered[i]];}
  return <section className="lab"><div className="lab-label" lang="fa" dir="rtl">سنجش یادگیری</div><h3>{question}</h3>{ordered.map(({option,index},i)=><button type="button" key={index} className="quiz-option" aria-pressed={selected===index} onClick={()=>setSelected(index)}>{(i+1).toLocaleString('fa-IR')}. {option}</button>)}{selected!==null&&<div className="quiz-feedback" role="status"><strong lang="fa" dir="rtl">{selected===correct?'آفرین، درست است!':'درست نیست؛ دلیل پاسخ را بخوانید و دوباره تلاش کنید.'}</strong><p>{explanation}</p></div>}</section>;
}
