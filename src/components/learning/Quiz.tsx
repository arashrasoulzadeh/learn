import {useState} from 'react';
type Props={question:string;options:string[];correct:number;explanation:string};
export default function Quiz({question,options,correct,explanation}:Props){
  const [selected,setSelected]=useState<number|null>(null);
  return <section className="lab"><div className="lab-label">KNOWLEDGE CHECK</div><h3>{question}</h3>{options.map((option,i)=><button type="button" key={i} className="quiz-option" aria-pressed={selected===i} onClick={()=>setSelected(i)}>{String.fromCharCode(65+i)}. {option}</button>)}{selected!==null&&<div className="quiz-feedback" role="status"><strong>{selected===correct?'Correct!':'Not quite. Try again.'}</strong><p>{selected===correct?explanation:'Consider what each layer is responsible for.'}</p></div>}</section>;
}
