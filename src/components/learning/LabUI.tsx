import {useEffect,useState,useRef,type ReactNode,type CSSProperties} from 'react';
export const faNumber=(n:number)=>new Intl.NumberFormat('fa-IR',{useGrouping:false}).format(n);
export type LearningStep={name:string;short:string};
export type ScenarioOption={value:string;label:string};
export function usePlayback(count:number,stepDuration=6500){
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[finished,setFinished]=useState(false),[preview,setPreview]=useState(false),[motionVersion,setMotionVersion]=useState(0);
  const last=step===count-1;
  useEffect(()=>{
    if(!playing)return;
    const id=window.setTimeout(()=>{if(last){setPlaying(false);setPreview(false);setFinished(true);}else setStep(v=>v+1);},stepDuration/speed);
    return()=>window.clearTimeout(id);
  },[playing,step,speed,last,stepDuration]);
  const replayStep=()=>{setPlaying(false);setPreview(true);setMotionVersion(v=>v+1);};
  const pause=()=>{setPlaying(false);setPreview(false);};
  const jump=(n:number)=>{setPlaying(false);setFinished(false);setStep(Math.max(0,Math.min(count-1,n)));setPreview(true);setMotionVersion(v=>v+1);};
  const toggle=()=>{if(playing)pause();else{if(finished){setStep(0);setFinished(false);}setPreview(false);setMotionVersion(v=>v+1);setPlaying(true);}};
  return {step,playing,speed,setSpeed,last,finished,jump,toggle,pause,preview,motionVersion,replayStep};
}
type Playback=ReturnType<typeof usePlayback>;
type LabIconName='play'|'pause'|'replay'|'prev'|'next';
function LabIcon({name}:{name:LabIconName}){
  return <svg className="lab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name==='play'?<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>:name==='pause'?<path d="M9 5v14M15 5v14"/>:name==='replay'?<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>:name==='prev'?<path d="M9 5l7 7-7 7"/>:<path d="m15 5-7 7 7 7"/>}
  </svg>;
}
export function LabButton({children,onClick,disabled=false,label,primary=false}:{children:ReactNode;onClick:()=>void;disabled?:boolean;label?:string;primary?:boolean}){
  return <button className={primary?'primary':'secondary'} type="button" aria-label={label} onClick={onClick} disabled={disabled}>{children}</button>;
}
export function LabSelect({label,value,options,onChange}:{label:string;value:string;options:readonly ScenarioOption[];onChange:(v:string)=>void}){
  return <label>{label}<select value={value} onChange={e=>onChange(e.target.value)}>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
export function LabToolbar({playback,count,children,actions}:{playback:Playback;count:number;children?:ReactNode;actions?:ReactNode}){
  const {step,playing,speed,setSpeed,last,finished,jump,toggle}=playback;
  return <div className="request-toolbar">
    <div className="lab-controls">
      {children}
      <LabSelect label="سرعت" value={String(speed)} onChange={v=>setSpeed(Number(v))} options={[{value:'0.5',label:'۰٫۵ برابر'},{value:'1',label:'۱ برابر'},{value:'2',label:'۲ برابر'}]}/>
      <div className="lab-playback-buttons">
        <LabButton primary onClick={toggle}><LabIcon name={playing?'pause':finished?'replay':'play'}/>{playing?'توقف':finished?'پخش مجدد':'پخش'}</LabButton>
        <LabButton label="مرحلهٔ قبل" onClick={()=>jump(step-1)} disabled={step===0}><LabIcon name="prev"/></LabButton>
        <LabButton label="مرحلهٔ بعد" onClick={()=>jump(step+1)} disabled={last}><LabIcon name="next"/></LabButton>
        <LabButton onClick={()=>jump(0)}><LabIcon name="replay"/>از ابتدا</LabButton>{actions}
      </div>
    </div>
    <div className="request-counter"><span>مرحلهٔ {faNumber(step+1)} از {faNumber(count)}</span><span className="request-progress" aria-hidden="true"><span style={{width:((step+1)/count*100)+'%'}}/></span></div>
  </div>;
}
export function LabTimeline({steps,step,onChange,label='مراحل درس'}:{steps:readonly LearningStep[];step:number;onChange:(i:number)=>void;label?:string}){
  return <nav className="request-timeline" aria-label={label} style={{'--step-count':steps.length} as CSSProperties}>{steps.map((s,i)=><button type="button" className="request-step" key={i} aria-current={step===i?'step':undefined} data-done={i<step} aria-label={s.name} onClick={()=>onChange(i)}><span>{faNumber(i+1)}</span><strong>{s.short}</strong></button>)}</nav>;
}
export function LabStage({name,label,children,explanation,route,next,result,visual,evidence,context,diagnostic}:{name:string;label:string;children:ReactNode;explanation?:string;route?:string[];next?:string;result?:string;visual?:ReactNode;evidence?:ReactNode;context?:string;diagnostic?:string}){
  return <section className="request-stage" aria-live="polite">
    <span className="lab-label">{label}</span><h2>{name}</h2><p>{children}</p>{visual}
    {explanation&&<div className="stage-explanation"><h3>مکانیزم و دلیل این رفتار</h3><p>{explanation}</p></div>}
    {evidence&&<div className="stage-evidence">{evidence}</div>}
    {result&&<div className="stage-result"><h3>نتیجهٔ قابل بررسی</h3><p>{result}</p></div>}
    {route&&route.length>0&&<div className="stage-route"><span>{route.length===1?'محل عملیات':'ترتیب عبور از اجزا'}</span><div>{route.map((actor,i)=><span className="stage-actor" key={i}>{i>0&&<span className="stage-arrow" aria-hidden="true">←</span>}<b>{actor}</b></span>)}</div></div>}
    {diagnostic&&<div className="stage-diagnostic"><h3>از دید برنامه‌نویس</h3><p>{diagnostic}</p></div>}
    {context&&<details className="stage-model"><summary>فرض‌ها و محدودهٔ این مدل</summary><p>{context}</p></details>}
    <div className="stage-next"><span>{next?'مرحلهٔ بعد':'پایان این سناریو'}</span>{next?<strong>{next}</strong>:<a className="practice-jump" href="#applied-practice" onClick={event=>{const target=document.getElementById('applied-practice');if(target){event.preventDefault();target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}}}>حل تمرین کاربردی ←</a>}</div>
  </section>;
}
export function LabMessage({title,content,waiting,tag,tone}:{title:string;content?:string;waiting:string;tag?:string;tone?:'success'|'error'}){
  return <section className={'request-message'+(content===undefined?' waiting':'')}><p className="eyebrow"><span className="message-heading">{title}</span>{tag&&<bdi className="lab-message-tag" data-tone={tone??'neutral'} dir="ltr">{tag}</bdi>}</p><pre dir={content===undefined?'rtl':'ltr'}>{content??waiting}</pre></section>;
}
export function LabNote({children}:{children:ReactNode}){return <p className="request-note">{children}</p>;}
export function LabScreen({label,toolbar,graph,detail,timeline,overview,graphFooter,stepKey,headingActions,graphTitle='مسیر ارتباط',stateView}:{label:string;toolbar:ReactNode;graph:ReactNode;detail:ReactNode;timeline:ReactNode;overview?:ReactNode;graphFooter?:ReactNode;stepKey?:string;headingActions?:ReactNode;graphTitle?:string;stateView?:ReactNode}){
  const detailRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(detailRef.current)detailRef.current.scrollTop=0;},[stepKey]);
  return <section className="request-experience" aria-label={label}>{toolbar}<div className="request-canvas"><div className="lab-canvas-title"><strong>{graphTitle}</strong>{headingActions??<span>شبیه‌سازی آموزشی</span>}</div>{overview}{graph}{stateView}<div className="flow-legend" aria-label="راهنمای دیاگرام"><span><i className="legend-out"/>پیام جاری</span><span><i className="legend-return"/>مسیر برگشت</span><span><i className="legend-error"/>مسیر خطا</span><span><i className="legend-idle"/>مسیر غیرفعال</span></div>{graphFooter}</div><div className="request-detail" ref={detailRef}>{detail}</div>{timeline}</section>;
}
