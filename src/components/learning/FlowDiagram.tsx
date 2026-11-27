import {useId,useEffect,useState,useRef,type ReactNode} from 'react';
export type FlowNode={x:number;y:number;label:string;sub:string;icon:string};
export type FlowEdge=readonly [number,number];
function NodeIcon({icon}:{icon:string}){
  const common={fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
  if(icon==='browser')return <g {...common}><rect x="-15" y="-11" width="30" height="22" rx="3"/><path d="M-15 -4 H15 M-10 -7 h1 M-6 -7 h1 M-2 -7 h1"/></g>;
  if(icon==='dns')return <g {...common}><circle r="13"/><ellipse rx="6" ry="13"/><path d="M-12 -5 H12 M-12 5 H12"/></g>;
  if(icon==='proxy')return <g {...common}><path d="M0 -14 L13 -7 V7 L0 14 L-13 7 V-7 Z M-13 -7 L0 0 L13 -7 M0 0 V14"/></g>;
  if(icon==='router')return <g {...common}><rect x="-15" y="-8" width="30" height="16" rx="4"/><path d="M-9 -8v-6 M9 -8v-6 M-9 0h2 M-3 0h2 M3 0h7"/></g>;
  if(icon==='cache')return <g {...common}><rect x="-13" y="-13" width="26" height="26" rx="4"/><path d="m2 -10-9 12h7l-2 8 9-12H0z"/></g>;
  if(icon==='shield')return <g {...common}><path d="M0 -15 13 -10v10c0 8-7 12-13 16-6-4-13-8-13-16v-10zM-6 0l4 4 8-9"/></g>;
  if(icon==='cpu')return <g {...common}><rect x="-10" y="-10" width="20" height="20" rx="3"/><rect x="-5" y="-5" width="10" height="10" rx="1"/><path d="M-6 -15v5 M0 -15v5 M6 -15v5 M-6 10v5 M0 10v5 M6 10v5 M-15 -6h5 M-15 0h5 M-15 6h5 M10 -6h5 M10 0h5 M10 6h5"/></g>;
  if(icon==='queue')return <g {...common}><rect x="-15" y="-11" width="30" height="22" rx="3"/><path d="M-5 -11v22 M5 -11v22 M-12 0h4 M-2 0h4 M8 0h4"/></g>;
  if(icon==='memory')return <g {...common}><rect x="-15" y="-12" width="30" height="24" rx="3"/><path d="M-15 -4h30 M-15 4h30 M-5 -12v24 M5 -12v24"/></g>;
  if(icon==='key')return <g {...common}><circle cx="-6" cy="-4" r="7"/><path d="m-1 1 13 13 M7 9l4-4 M10 12l4-4"/></g>;
  if(icon==='app')return <g {...common}><rect x="-14" y="-13" width="28" height="11" rx="2"/><rect x="-14" y="2" width="28" height="11" rx="2"/><path d="M-8 -7 h2 M-8 7 h2 M1 -7 h7 M1 7 h7"/></g>;
  return <g {...common}><ellipse cy="-9" rx="13" ry="5"/><path d="M-13 -9 V9 C-13 16 13 16 13 9 V-9 M-13 0 C-13 7 13 7 13 0"/></g>;
}

export function DiagramNode({node,active,accent,children}:{node:FlowNode;active:boolean;accent:string;children?:ReactNode}){
  return <g data-node={node.icon} transform={'translate('+node.x+' '+node.y+')'} data-active={active} style={{color:active?accent:'var(--muted)'}}>{active&&<rect x="-65" y="-48" width="130" height="96" rx="20" fill={accent} opacity=".09"/>}<rect x="-59" y="-42" width="118" height="84" rx="15" fill={active?'var(--panel2)':'var(--bg)'} stroke={active?accent:'var(--line)'} strokeWidth={active?2:1.2}/><g transform="translate(0 -21)">{children??<NodeIcon icon={node.icon}/>}</g><text y="12" textAnchor="middle" fill={active?accent:'var(--ink)'} fontSize="14" direction="rtl" fontWeight="600">{node.label}</text><text y="30" textAnchor="middle" fill="var(--muted)" fontSize="10.5" direction="rtl">{node.sub}</text></g>;
}
type Point={x:number;y:number};
function point(p:Point){return Number(p.x.toFixed(2))+' '+Number(p.y.toFixed(2));}
function centerTrack(route:readonly FlowNode[]){return route.map((p,i)=>(i?'L ':'M ')+point(p)).join(' ');}
function laneSegment(a:FlowNode,b:FlowNode,offset=0){
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
  // Intersect the actual node rectangle (plus a small gap), rather than drawing through its text.
  const sx=nx*offset,sy=ny*offset;
  const exit=(sign:number)=>Math.min(Math.abs(ux)>1e-6?(63-sign*Math.sign(ux)*sx)/Math.abs(ux):Infinity,Math.abs(uy)>1e-6?(46-sign*Math.sign(uy)*sy)/Math.abs(uy):Infinity,len*.45);
  const from={x:a.x+ux*exit(1)+sx,y:a.y+uy*exit(1)+sy};
  const to={x:b.x-ux*exit(-1)+sx,y:b.y-uy*exit(-1)+sy};
  return {from,to,angle:Math.atan2(dy,dx)*180/Math.PI,mid:{x:(from.x+to.x)/2,y:(from.y+to.y)/2}};
}
function lane(route:readonly FlowNode[],offset:number){return route.slice(1).map((b,i)=>laneSegment(route[i],b,offset));}
type Flight=ReturnType<typeof laneSegment>&{kind:'forward'|'return'|'final'|'local';label:string;source:string;target:string;drop?:boolean};
function flightPlan(route:readonly FlowNode[],returnRoute:readonly FlowNode[]|undefined,finalRoute:readonly FlowNode[]|undefined,packetLabel:string,labels:readonly string[]|undefined,drop:boolean):Flight[]{
 if(route.length===1){const n=route[0];return [{from:n,to:n,mid:n,angle:0,kind:'local',label:labels?.[0]??packetLabel,source:n.label,target:n.label,drop}];}
 const result:Flight[]=[];
 const add=(path:readonly FlowNode[],kind:Flight['kind'],offset:number,fallback:string)=>{
  lane(path,offset).forEach((segment,i)=>result.push({...segment,kind,label:labels?.[result.length]??fallback,source:path[i].label,target:path[i+1].label}));
 };
 add(route,'forward',returnRoute?.length?6:0,packetLabel);
 if(returnRoute?.length)add(returnRoute,'return',6,'Reply');
 if(finalRoute?.length)add(finalRoute,'final',-15,'Confirm');
 if(drop&&result.length)result[result.length-1].drop=true;
 return result;
}
// Each hop is its own flight. No visible jump through the centre of a node,
// and a response never inherits the outgoing request's label or colour.
function MotionPlayer({plan,speed,accent,onPhase}:{plan:Flight[];speed:number;accent:string;onPhase:(i:number)=>void}){
 const ref=useRef<SVGGElement>(null),message=useRef<SVGTextElement>(null),body=useRef<SVGGElement>(null);
 const signature=JSON.stringify(plan);
 useEffect(()=>{
  const el=ref.current,msg=message.current,packet=body.current;
  if(!el||!msg||!packet||plan.length===0)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const total=Math.min(5200,Math.max(1500,plan.length*1150))/speed,per=total/plan.length;
  let frame=0,started:number|undefined,last=-1,stopped=false;
  el.setAttribute('data-motion-status','running');
  el.setAttribute('data-flight-count',String(plan.length));
  const finish=()=>{el.setAttribute('opacity','0');el.setAttribute('data-motion-status','complete');onPhase(plan.length);};
  const tick=(now:number)=>{
   if(stopped)return;
   if(started===undefined)started=now;
   const elapsed=now-started;
   if(elapsed>=total||reduced.matches){finish();return;}
   const i=Math.min(plan.length-1,Math.floor(elapsed/per)),p=(elapsed-i*per)/per,s=plan[i];
   if(i!==last){last=i;onPhase(i);el.setAttribute('data-flight-index',String(i));msg.textContent=s.kind==='local'?'':s.label;packet.style.color=s.kind==='return'?'var(--blue)':accent;}
   const travel=Math.max(0,Math.min(1,(p-.08)/.76));
   const x=s.from.x+(s.to.x-s.from.x)*travel,y=s.from.y+(s.to.y-s.from.y)*travel;
   const opacity=Math.min(1,p/.08,(1-p)/.16);
   el.setAttribute('opacity',String(Math.max(0,opacity)));
   el.setAttribute('transform','translate('+point({x,y})+')');
   packet.setAttribute('transform',s.kind==='local'?'scale('+(1+.12*Math.sin(p*Math.PI*4))+')':'scale(1)');
   frame=requestAnimationFrame(tick);
  };
  if(reduced.matches)finish();else frame=requestAnimationFrame(tick);
  return()=>{stopped=true;cancelAnimationFrame(frame);};
 },[signature,speed,accent,onPhase]);
 return <g ref={ref} className="request-packet-motion" data-main-motion="true" data-motion-status="ready" opacity="0" aria-hidden="true">
  <g ref={body} style={{color:accent}}>{plan[0]?.kind==='local'?<rect x="-64" y="-46" width="128" height="92" rx="17" stroke="currentColor" strokeWidth="2.5" fill="none"/>:<><circle r="13" fill="currentColor" opacity=".22"/><rect x="-8" y="-5.5" width="16" height="11" rx="3" fill="currentColor" stroke="var(--bg)" strokeWidth="1.5"/><path d="M-6 -3 L0 1 L6 -3" stroke="var(--bg)" fill="none" strokeWidth="1.3"/></>}</g>
  <text ref={message} className="motion-label" textAnchor="middle" y="-18" fill="var(--ink)" stroke="var(--bg)" strokeWidth="4" paintOrder="stroke" fontSize="12" fontWeight="700" direction="ltr"/>
 </g>;
}
function FlowPacket({route,plan,active,accent}:{route:readonly FlowNode[];plan:Flight[];active:number;accent:string}){
 const local=plan.length===1&&plan[0].kind==='local';
 if(local){const s=plan[0];return <g data-local-step="true" data-flight="0" transform={'translate('+s.from.x+' '+(s.from.y+54)+')'}><rect x="-46" y="-10" width="92" height="20" rx="6" fill="var(--bg)" stroke={accent}/><text textAnchor="middle" y="4" fill={accent} fontSize="10" direction="rtl">{s.drop?'حذف محلی بسته':'عملیات محلی'}</text></g>;}
 return <g>
  <path data-flow-path d={centerTrack(route)} fill="none" stroke="none"/>
  {plan.map((s,i)=>{const color=s.kind==='return'?'var(--blue)':accent,highlight=active===i;
   const vertical=Math.abs(s.from.y-s.to.y)>Math.abs(s.from.x-s.to.x);
   const cx=s.mid.x+(vertical?(s.mid.x>180?-16:16):0),cy=s.mid.y-(vertical?0:(s.kind==='return'?-14:s.kind==='final'?14:17));
   return <g key={i} data-lane={s.kind} data-flight={i} data-current-flight={highlight}>
    <path d={'M '+point(s.from)+' L '+point(s.to)} stroke={color} strokeWidth={highlight?13:7} opacity={highlight?".22":".09"} fill="none" strokeLinecap="round"/>
    <path data-visible-flow d={'M '+point(s.from)+' L '+point(s.to)} fill="none" stroke={color} strokeWidth={highlight?3.5:2.5} strokeLinecap="round" strokeDasharray={s.kind==='return'?'5 3':s.kind==='final'?'2 3':undefined}/>
    <path data-flow-arrow={s.kind} d="M -8 -4.5 L 0 0 L -8 4.5" transform={'translate('+point(s.to)+') rotate('+s.angle+')'} fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
    <g transform={'translate('+point({x:cx,y:cy})+')'}><circle r="9" fill="var(--bg)" stroke={color}/><text textAnchor="middle" y="3.5" fill={color} fontSize="10" fontWeight="700">{i+1}</text></g>
    {s.drop&&<g data-packet-drop="true" transform={'translate('+point(s.to)+')'}><circle r="10" fill="var(--bg)" stroke="var(--danger)" strokeWidth="2"/><path d="M-4 -4 L4 4 M-4 4 L4 -4" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round"/></g>}
   </g>;
  })}
 </g>;
}
type FlowDiagramProps={nodes:readonly FlowNode[];edges:readonly FlowEdge[];activeNodes:readonly number[];route:readonly FlowNode[];playing:boolean;speed:number;accent?:string;animationKey:string;label:string;caption:string;captionDirection?:'rtl'|'ltr';returnRoute?:readonly FlowNode[];packetLabel?:string;compactLayout?:{width:number;height:number;positions:readonly {x:number;y:number}[]};finalRoute?:readonly FlowNode[];preview?:boolean;motionVersion?:number;onReplay?:()=>void;flightLabels?:readonly string[];drop?:boolean};
function FlowScene({nodes,edges,activeNodes,route,playing,speed,accent='var(--accent)',label,caption,captionDirection='rtl',returnRoute,packetLabel='Action',finalRoute,preview,onReplay,flightLabels,drop=false,width,height,compact}:FlowDiagramProps&{width:number;height:number;compact:boolean}){
 const gridId=useId(),[phase,setPhase]=useState(-1);
 const plan=flightPlan(route,returnRoute,finalRoute,packetLabel,flightLabels,drop);
 const moving=playing||preview;
 const active=moving?phase:-1;
 const top=compact?0:Math.min(...nodes.map(n=>n.y))-62;
 const bottom=compact?height:Math.max(...nodes.map(n=>n.y))+72;
 return <>
  <div className="flight-sequence" aria-label="ترتیب پیام‌های این مرحله">
   <div className="flight-sequence-head"><span>{plan.length===1&&plan[0].kind==='local'?'عملیات در همان جزء':'ترتیب ارسال و دریافت'} <b>{active>=0&&active<plan.length?String(active+1)+' / '+plan.length:active===plan.length?'✓':''}</b></span>{onReplay&&<button type="button" className="flight-replay" onClick={onReplay}>بازپخش همین مرحله</button>}</div>
   <div className="flight-steps">{plan.map((s,i)=><div className="flight-chip" key={i} data-kind={s.kind} data-active={active===i} data-past={active>i} data-drop={!!s.drop} title={s.source===s.target?s.source:s.source+' → '+s.target}><small>{i+1}</small><bdi dir="ltr">{s.label}</bdi>{s.drop&&<span aria-label="بسته حذف می‌شود">×</span>}</div>)}</div>
  </div>
  <svg className="flow-diagram" data-layout={compact?'compact':'wide'} viewBox={'0 '+top+' '+width+' '+(bottom-top)} direction="ltr" role="img" aria-label={label+'؛ '+caption}>
   <title>{caption}</title>
   <defs><pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="var(--line)"/></pattern></defs>
   <rect y={top} width={width} height={bottom-top} rx="12" fill={'url(#'+gridId+')'} opacity=".55"/>
   {edges.map(([a,b])=>{const s=laneSegment(nodes[a],nodes[b]);return <line key={a+'-'+b} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke="var(--line)" strokeWidth="2" strokeDasharray="5 6"/>;})}
   <FlowPacket route={route} plan={plan} active={active} accent={accent}/>
   {nodes.map((node,i)=><DiagramNode key={i} node={node} active={activeNodes.includes(i)} accent={accent}/>)}
   {moving&&<MotionPlayer plan={plan} speed={speed} accent={accent} onPhase={setPhase}/>}
   <text x={width/2} y={bottom-5} fill="var(--muted)" textAnchor="middle" fontSize="10" direction={captionDirection}>مدل آموزشی · مقیاس زمانی واقعی نیست</text>
  </svg>
 </>;
}
export function FlowDiagram(props:FlowDiagramProps){
 const {nodes,route,returnRoute,finalRoute,compactLayout,animationKey,motionVersion}=props;
 const [compact,setCompact]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(max-width: 600px)');
  const sync=()=>setCompact(media.matches);
  sync();media.addEventListener('change',sync);
  return()=>media.removeEventListener('change',sync);
 },[]);
 const layout=compact?compactLayout:undefined;
 const displayNodes=layout?nodes.map((node,i)=>({...node,...layout.positions[i]})):nodes;
 const remap=(path:readonly FlowNode[])=>path.map(node=>displayNodes[nodes.indexOf(node)]??node);
 return <FlowScene key={animationKey+'-'+(layout?'compact':'wide')+'-'+(motionVersion??0)} {...props} nodes={displayNodes} route={remap(route)} returnRoute={returnRoute?remap(returnRoute):undefined} finalRoute={finalRoute?remap(finalRoute):undefined} width={layout?.width??790} height={layout?.height??355} compact={!!layout}/>;
}
