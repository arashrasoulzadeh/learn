import type {ReactNode} from 'react';
import {faNumber} from './LabUI';
type Props={kind:string;title:string;labels:readonly string[];values:readonly string[];context:string;step:number;tone?:'success'|'error'};
function StateValue({kind,index,value}:{kind:string;index:number;value:string}){
  let items:ReactNode=null;
  if(kind==='udp'&&index===1&&/^\d+(, \d+)*$/.test(value)){
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
