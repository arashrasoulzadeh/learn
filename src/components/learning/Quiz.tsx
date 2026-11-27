import {useState} from 'react';
type Props={question:string;options:string[];correct:number;explanation:string};
export default function Quiz({question,options,correct,explanation}:Props){
  const [selected,setSelected]=useState<number|null>(null);
  return <section className="lab"><div className="lab-label">سنجش یادگیری</div><h3>{question}</h3>{options.map((option,i)=><button type="button" key={i} className="quiz-option" aria-pressed={selected===i} onClick={()=>setSelected(i)}>{(i+1).toLocaleString('fa-IR')}. {option}</button>)}{selected!==null&&<div className="quiz-feedback" role="status"><strong>{selected===correct?'آفرین، درست است!':'درست نیست؛ دلیل پاسخ را بخوانید و دوباره تلاش کنید.'}</strong><p>{explanation}</p></div>}</section>;
}
