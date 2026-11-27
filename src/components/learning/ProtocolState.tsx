import type {ReactNode} from 'react';
import {faNumber} from './LabUI';
type Props={kind:string;title:string;labels:readonly string[];values:readonly string[];context:string;step:number;tone?:'success'|'error'};
function StateValue({kind,index,value}:{kind:string;index:number;value:string}){
  let items:ReactNode=null;
  if(kind==='process-thread'&&index===1){
    const valueMatch=value.match(/counter=(\d+)/);
    items=<span className="backend-counter"><b>{valueMatch?.[1]??value}</b>{value.includes(';')&&<small>{value.split(';')[1].trim()}</small>}</span>;
  }else if(kind==='jwt'&&index===0&&value==='header | payload | signature'){
    items=<span className="jwt-parts">{['header','payload','signature'].map((part,i)=><span key={part} data-part={i}>{part}</span>)}</span>;
  }else if(kind==='stack-heap'&&index===0){
    items=<span className="backend-stack">{value.split(' | ').reverse().map((frame,i)=><span key={i} data-top={i===0}>{frame}{i===0&&<small> TOP</small>}</span>)}</span>;
  }else if(kind==='event-loop'&&index===0&&/^[A-D]( [A-D])*$/.test(value)){
    items=<span className="state-token-list">{value.split(' ').map((v,i)=><span key={i}>{v}</span>)}</span>;
  }else if((kind==='async-await'&&index===1)||(kind==='event-loop'&&index>0)){
    items=<span className="state-token-list backend-queue">{value.split(' | ').map((v,i)=><span key={i} data-state={/rejected/i.test(v)?'error':/fulfilled/i.test(v)?'success':'pending'}>{v}</span>)}</span>;
  }else if((kind==='authentication'||kind==='authorization'||kind==='jwt')&&index===2){
    const denied=/deny|denied|anonymous|rejected/i.test(value),allowed=/200|authenticated|allow|verified/i.test(value)&&!denied;
    items=<span className="backend-decision" data-decision={denied?'deny':allowed?'allow':'pending'}>{denied?'× ':allowed?'✓ ':'· '}{value}</span>;
  }else if(kind==='rest-api'&&index===1){
    items=<span className="backend-resource">{value.split(' · ').map((v,i)=><span key={i}>{v}</span>)}</span>;
  }else if(kind==='middleware'&&index===0){
    items=<span className="backend-queue state-token-list">{value.split('; ').map((v,i)=><span key={i}>{v}</span>)}</span>;
  }else if(kind==='udp'&&index===1&&/^\d+(, \d+)*$/.test(value)){
    const seen=new Set<string>();
    items=<span className="state-token-list">{value.split(', ').map((frame,i)=>{const repeat=seen.has(frame);seen.add(frame);return <span key={i} data-repeat={repeat} title={repeat?'فریم تکراری':'فریم دریافتی'}>{frame}{repeat?' ×2':''}</span>;})}</span>;
  }else if(kind==='tcp'&&index===1&&/^(101|105)$/.test(value)){
    items=<span className="state-byte-strip">{[101,102,103,104].map(n=><span key={n} data-received={n<Number(value)}>{n}</span>)}<b>→ {value}</b></span>;
  }else if(kind==='http-methods'&&index===1&&value.includes(' | ')){
    items=<span className="state-token-list state-record-list">{value.split(' | ').map((record,i)=><span key={i}>{record}</span>)}</span>;
  }else if(kind==='http-status-codes'&&index===0){
    const family=/^[1-5]\d\d/.test(value)?value[0]:'';
    items=<><span className="state-code">{value}</span><span className="state-family-list">{[1,2,3,4,5].map(n=><span key={n} data-current={family===String(n)}>{n}xx</span>)}</span></>;
  }
  return <div className="state-value" dir="ltr">{items??<span>{value}</span>}</div>;
}
export default function ProtocolState({kind,title,labels,values,context,step,tone}:Props){
  return <section className="protocol-state" data-protocol={kind} aria-label={title} data-tone={tone??'neutral'}>
    <header><span>{title} <small className="state-snapshot">پس از مرحله</small></span><span className="state-step">مرحلهٔ {faNumber(step+1)}</span></header>
    <div className="state-cells">{labels.map((label,i)=><div className="state-cell" key={label}><span className="state-label">{label}</span><StateValue kind={kind} index={i} value={values[i]??'—'}/></div>)}</div>
    <p>{context}</p>
  </section>;
}
