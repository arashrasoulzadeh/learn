import {useState} from 'react';
export type Practice={question:string;options:string[];correct:number;explanation:string;hint:string};
export type Teaching={goal:string;practice:Practice;terms:string[][]};
export function LearningGoal({goal}:{goal:string}){
  return <div className="lesson-goal"><span>هدف یادگیری</span><p>{goal}</p></div>;
}
export function PracticeCheck({practice,nextLesson}:{practice:Practice;nextLesson?:{slug:string;label:string;category?:string}}){
  const [selected,setSelected]=useState<number|null>(null);
  return <section id="applied-practice" tabIndex={-1} className="practice-check" aria-label="تمرین کاربردی"><span className="practice-kicker">تمرین کاربردی</span><h3>{practice.question}</h3>
    <div className="practice-options">{practice.options.map((option,i)=><button key={i} type="button" className="practice-option" aria-pressed={selected===i} data-result={selected===i?(i===practice.correct?'correct':'retry'):undefined} onClick={()=>setSelected(i)}>{option}</button>)}</div>
    {selected!==null&&<div className="practice-feedback" role="status" data-correct={selected===practice.correct}><strong>{selected===practice.correct?'درست است! دلیل پاسخ را مرور کنید.':'دوباره فکر کنید.'}</strong><p>{selected===practice.correct?practice.explanation:practice.hint}</p>{selected===practice.correct&&nextLesson&&<a className="practice-next" href={import.meta.env.BASE_URL.replace(/\/$/,'')+'/concepts/'+(nextLesson.category??'networking')+'/'+nextLesson.slug+'/'}>درس بعدی: {nextLesson.label} ←</a>}{selected===practice.correct&&!nextLesson&&<p>این آخرین درس این سطح است؛ سناریوهای دیگر و واژه‌نامه را هم مرور کنید.</p>}</div>}
  </section>;
}
