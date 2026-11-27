import {useEffect,useId,useRef,useState} from 'react';
import {snapshot,type DeepLesson,type TraceEvent} from './types';
import {deepLessons} from './index';
import {faNumber} from '../LabUI';

function TracePlayer({lesson}:{lesson:DeepLesson}){
 const [mode,setMode]=useState(0),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
 const current=lesson.cases[mode],count=current.events.length,done=step===count;
 const previous=snapshot(current,Math.max(0,step-1)),state=snapshot(current,step);
 const event=step?current.events[step-1]:undefined;
 const progress=step/count*100;
 const select=(index:number)=>{setPlaying(false);setMode(index);setStep(0);};
 const move=(n:number)=>{setPlaying(false);setStep(Math.max(0,Math.min(count,n)));};
 useEffect(()=>{if(!playing)return;const id=window.setTimeout(()=>{if(step>=count)setPlaying(false);else setStep(v=>v+1);},1500/speed);return()=>window.clearTimeout(id);},[playing,step,count,speed]);
 const toggle=()=>{if(playing){setPlaying(false);return;}if(done)setStep(0);setPlaying(true);};
 const renderEvent=(row:TraceEvent,i:number)=>{
  const active=i===step-1,visible=i<step;
  const from=row.lane,to=row.to??from;
  const lo=Math.min(from,to),hi=Math.max(from,to),direction=to>from?'right':'left';
  return <button type="button" className="deep-event-row" key={i} data-active={active} data-revealed={visible} data-tone={row.tone??'neutral'} onClick={()=>move(i+1)} aria-current={active?'step':undefined} aria-label={'رویداد '+faNumber(i+1)+'، '+row.name}>
   <span className="deep-tick">{row.at}</span>
   <span className="deep-lane-row" style={{gridTemplateColumns:'repeat('+lesson.lanes.length+', minmax(0, 1fr))'}}>
    {lesson.lanes.map((_,j)=><i key={j} className="deep-lane-line"/>)}
    {visible&&<span className={'deep-signal'+(from===to?' deep-local':'')} data-direction={direction} style={{gridColumn:(lo+1)+' / '+(hi+2)}}><i/><span>{row.wire}</span></span>}
    {!visible&&<span className="deep-unrevealed" style={{gridColumn:(from+1)+' / '+(from+2)}}>···</span>}
   </span>
   <span className="deep-event-name">{visible?row.name:'رویداد '+faNumber(i+1)}</span>
  </button>;
 };
 return <div className="deep-player" data-deep-slug={lesson.slug}>
  <p className="deep-kicker">آزمایشگاه تحلیل اجرا · مدل قطعی آموزشی</p>
  <div className="deep-intro"><h3>{lesson.title}</h3><p>{lesson.question}</p><small>{lesson.assumptions}</small></div>
  <div className="deep-modes" role="group" aria-label="انتخاب راهبرد آزمایش">{lesson.cases.map((c,i)=><button type="button" key={c.id} aria-pressed={mode===i} onClick={()=>select(i)}>{c.label}</button>)}</div>
  <div className="deep-control">
   <button className="primary" type="button" onClick={toggle}>{playing?'توقف آزمایش':done?'پخش دوبارهٔ آزمایش':'پخش آزمایش'}</button>
   <button className="secondary" type="button" aria-label="رویداد قبل" disabled={step===0} onClick={()=>move(step-1)}>→</button>
   <button className="secondary" type="button" aria-label="رویداد بعد" disabled={done} onClick={()=>move(step+1)}>←</button>
   <button className="secondary" type="button" onClick={()=>move(0)}>شروع آزمایش</button>
   <label>سرعت <select aria-label="سرعت آزمایش" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.5}>۰٫۵×</option><option value={1}>۱×</option><option value={2}>۲×</option></select></label>
   <span className="deep-count">{faNumber(step)} / {faNumber(count)}</span>
  </div>
  <div className="deep-progress"><i style={{width:progress+'%'}}/></div>
  <div className="deep-grid">
   <section className="deep-trace" aria-label="ردیابی زمانی">
    <div className="deep-trace-head"><span>t</span><div style={{gridTemplateColumns:'repeat('+lesson.lanes.length+', minmax(0, 1fr))'}}>{lesson.lanes.map((lane,i)=><span key={i}>{lane}</span>)}</div><span>رویداد</span></div>
    <div className="deep-trace-body" dir="ltr">{current.events.map(renderEvent)}</div>
    <p className="deep-timing-note">t زمان منطقی مدل است، نه اندازه‌گیری شبکه یا سیستم واقعی.</p>
   </section>
   <section className="deep-inspector" aria-label="بازرس وضعیت">
    <h4>وضعیت پس از رویداد</h4>
    <div className="deep-state">{Object.entries(lesson.fields).map(([key,label])=><div className="deep-state-cell" key={key} data-changed={step>0&&state[key]!==previous[key]}><span>{label}</span><div dir="ltr">{step>0&&state[key]!==previous[key]&&<del>{String(previous[key])}</del>}<strong data-value={key}>{String(state[key])}</strong></div></div>)}</div>
    <div className="deep-current" aria-live="polite"><h4>{event?event.name:'پیش‌بینی کنید'}</h4><p>{event?event.why:'یکی از راهبردها را انتخاب کنید. پیش از پخش نتیجه را حدس بزنید؛ سپس با رویداد بعد تغییر وضعیت را دنبال کنید.'}</p>{event&&<code dir="ltr">{event.wire}</code>}</div>
    {done&&<div className="deep-verdict" role="status"><h4>نتیجهٔ آزمایش</h4><p>{current.verdict}</p><p>راهبرد دیگر را اجرا و وضعیت نهایی را مقایسه کنید.</p></div>}
   </section>
  </div>
  <div className="deep-technical"><section><h4>نمونهٔ کد یا قرارداد</h4><pre dir="ltr">{lesson.code}</pre></section><section><h4>در محیط واقعی چه بررسی کنیم؟</h4><p>{lesson.diagnose}</p><h4>محدودیت و تصمیم مهندسی</h4><p>{lesson.tradeoff}</p>{lesson.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}</section></div>
 </div>;
}
export default function DeepLab({slug,onOpen}:{slug:string;onOpen:()=>void}){
 const lesson=deepLessons[slug],ref=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),titleId=useId();
 const [open,setOpen]=useState(false);
 if(!lesson)return null;
 return <div className="deep-launch"><button ref={trigger} className="secondary deep-launch-button" type="button" aria-haspopup="dialog" onClick={()=>{onOpen();setOpen(true);ref.current?.showModal();}}><span aria-hidden="true">⌁</span> آزمایشگاه پیشرفته</button>
  <dialog ref={ref} dir="rtl" className="lab-dialog deep-dialog" aria-labelledby={titleId} onClose={()=>{setOpen(false);trigger.current?.focus();}} onClick={e=>{if(e.target===e.currentTarget)ref.current?.close();}}>
   <div className="deep-inner"><header><h2 id={titleId}>آزمایشگاه پیشرفته</h2><button className="secondary" type="button" aria-label="بستن پنجره" onClick={()=>ref.current?.close()}>×</button></header>{open&&<TracePlayer lesson={lesson}/>}</div>
  </dialog>
 </div>;
}
