import {useState} from 'react';
import {type Workshop} from './workshops';

export default function ArchitectureWorkshop({workshop:w,onSimulation}:{workshop:Workshop;onSimulation:()=>void}){
 const [selected,setSelected]=useState<number|null>(null);
 const [revealed,setRevealed]=useState(false);
 const correct=selected===w.correct;
 return <section className="architecture-workshop" aria-label="کارگاه طراحی با کد">
  <header><span className="workshop-kicker">سطح چهار · یادگیری مسئله‌محور</span><h2>{w.title}</h2><p>{w.problem}</p></header>
  <div className="workshop-change"><strong>۱. درخواست تغییر</strong><p>{w.change}</p></div>
  <section className="workshop-code"><h3>۲. کد اولیه</h3><pre dir="ltr"><code>{w.before}</code></pre></section>
  <div className="workshop-choices"><h3>۳. تصمیم یا پیش‌بینی شما</h3>{w.choices.map((choice,i)=><button type="button" className="secondary" key={choice} aria-pressed={selected===i} onClick={()=>{setSelected(i);setRevealed(false);}}>{choice}</button>)}</div>
  {selected!==null&&<div className="workshop-feedback" role="status" data-correct={correct}><strong>{correct?'درست است':'دوباره بررسی کنید'}</strong><p>{correct?'حالا نتیجه دو طراحی را کنار هم ببینید.':w.wrong}</p></div>}
  <button type="button" className="primary workshop-reveal" disabled={selected===null} aria-expanded={revealed} onClick={()=>setRevealed(v=>!v)}>{revealed?'پنهان کردن مقایسه':'۴. مقایسه کد و نتیجه'}</button>
  {revealed&&<div className="workshop-comparison">
   <section className="workshop-code"><h3>کد جایگزین</h3><pre dir="ltr"><code>{w.after}</code></pre></section>
   <div className="workshop-results"><div><strong>قبل</strong><code dir="ltr">{w.resultBefore}</code></div><div><strong>بعد</strong><code dir="ltr">{w.resultAfter}</code></div></div>
   <h3>چرا این تغییر مفید است؟</h3><p>{w.why}</p><h3>چه زمانی انتخاب مناسبی نیست؟</h3><p>{w.tradeoff}</p>
   <small>کد نمونه و خروجی مورد انتظار هستند؛ در مرورگر کد اجرا نمی‌شود.</small>
  </div>}
  <button type="button" className="secondary workshop-simulation" onClick={onSimulation}>مشاهدهٔ شبیه‌سازی تکمیلی ↓</button>
 </section>;
}
