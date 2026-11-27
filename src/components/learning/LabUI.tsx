import {useEffect,useState,type ReactNode,type CSSProperties} from 'react';
export const faNumber=(n:number)=>new Intl.NumberFormat('fa-IR',{useGrouping:false}).format(n);
export type LearningStep={name:string;short:string};
export type ScenarioOption={value:string;label:string};
export function usePlayback(count:number,stepDuration=3000){
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
  const last=step===count-1;
  useEffect(()=>{
    if(!playing)return;
    const id=window.setTimeout(()=>{if(last)setPlaying(false);else setStep(v=>v+1);},stepDuration/speed);
    return()=>window.clearTimeout(id);
  },[playing,step,speed,last,stepDuration]);
  const jump=(n:number)=>{setPlaying(false);setStep(Math.max(0,Math.min(count-1,n)));};
  const toggle=()=>{if(playing)setPlaying(false);else{if(last)setStep(0);setPlaying(true);}};
  return {step,playing,speed,setSpeed,last,jump,toggle};
}
type Playback=ReturnType<typeof usePlayback>;
export function LabButton({children,onClick,disabled=false,label,primary=false}:{children:ReactNode;onClick:()=>void;disabled?:boolean;label?:string;primary?:boolean}){
  return <button className={primary?'primary':'secondary'} type="button" aria-label={label} onClick={onClick} disabled={disabled}>{children}</button>;
}
export function LabSelect({label,value,options,onChange}:{label:string;value:string;options:readonly ScenarioOption[];onChange:(v:string)=>void}){
  return <label>{label}<select value={value} onChange={e=>onChange(e.target.value)}>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
export function LabToolbar({playback,count,children}:{playback:Playback;count:number;children?:ReactNode}){
  const {step,playing,speed,setSpeed,last,jump,toggle}=playback;
  return <div className="request-toolbar">
    <div className="lab-controls">
      {children}
      <LabSelect label="سرعت" value={String(speed)} onChange={v=>setSpeed(Number(v))} options={[{value:'0.5',label:'۰٫۵ برابر'},{value:'1',label:'۱ برابر'},{value:'2',label:'۲ برابر'}]}/>
      <LabButton primary onClick={toggle}>{playing?'❚❚ توقف':last?'↻ پخش مجدد':'▶ پخش'}</LabButton>
      <LabButton label="مرحلهٔ قبل" onClick={()=>jump(step-1)} disabled={step===0}>→</LabButton>
      <LabButton label="مرحلهٔ بعد" onClick={()=>jump(step+1)} disabled={last}>←</LabButton>
      <LabButton onClick={()=>jump(0)}>از ابتدا</LabButton>
    </div>
    <span className="request-counter">مرحلهٔ {faNumber(step+1)} از {faNumber(count)}</span>
  </div>;
}
export function LabTimeline({steps,step,onChange,label='مراحل درس'}:{steps:readonly LearningStep[];step:number;onChange:(i:number)=>void;label?:string}){
  return <nav className="request-timeline" aria-label={label} style={{'--step-count':steps.length} as CSSProperties}>{steps.map((s,i)=><button type="button" className="request-step" key={i} aria-current={step===i?'step':undefined} data-done={i<step} aria-label={s.name} onClick={()=>onChange(i)}><span>{faNumber(i+1)}</span><strong>{s.short}</strong></button>)}</nav>;
}
export function LabStage({name,label,children}:{name:string;label:string;children:ReactNode}){
  return <section className="request-stage" aria-live="polite"><span className="lab-label">{label}</span><h2>{name}</h2><p>{children}</p></section>;
}
export function LabMessage({title,content,waiting}:{title:string;content?:string;waiting:string}){
  return <section className={'request-message'+(content===undefined?' waiting':'')}><p className="eyebrow">{title}</p><pre dir={content===undefined?'rtl':'ltr'}>{content??waiting}</pre></section>;
}
export function LabNote({children}:{children:ReactNode}){return <p className="request-note">{children}</p>;}
export function LabScreen({label,toolbar,graph,detail,timeline}:{label:string;toolbar:ReactNode;graph:ReactNode;detail:ReactNode;timeline:ReactNode}){
  return <section className="request-experience" aria-label={label}>{toolbar}<div className="request-canvas">{graph}</div><div className="request-detail">{detail}</div>{timeline}</section>;
}
