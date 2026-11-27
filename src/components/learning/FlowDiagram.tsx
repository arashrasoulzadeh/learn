import {useId,useEffect,useState,type ReactNode} from 'react';
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
  if(icon==='app')return <g {...common}><rect x="-14" y="-13" width="28" height="11" rx="2"/><rect x="-14" y="2" width="28" height="11" rx="2"/><path d="M-8 -7 h2 M-8 7 h2 M1 -7 h7 M1 7 h7"/></g>;
  return <g {...common}><ellipse cy="-9" rx="13" ry="5"/><path d="M-13 -9 V9 C-13 16 13 16 13 9 V-9 M-13 0 C-13 7 13 7 13 0"/></g>;
}

export function DiagramNode({node,active,accent,children}:{node:FlowNode;active:boolean;accent:string;children?:ReactNode}){
  return <g data-node={node.icon} transform={'translate('+node.x+' '+node.y+')'} data-active={active} style={{color:active?accent:'var(--muted)'}}>{active&&<rect x="-65" y="-48" width="130" height="96" rx="20" fill={accent} opacity=".09"/>}<rect x="-59" y="-42" width="118" height="84" rx="15" fill={active?'var(--panel2)':'var(--bg)'} stroke={active?accent:'var(--line)'} strokeWidth={active?2:1.2}/><g transform="translate(0 -12)">{children??<NodeIcon icon={node.icon}/>}</g><text y="23" textAnchor="middle" fill={active?accent:'var(--ink)'} fontSize="14" direction="rtl" fontWeight="600">{node.label}</text><text y="62" textAnchor="middle" fill="var(--muted)" fontSize="12" direction="rtl">{node.sub}</text></g>;
}
type Point={x:number;y:number};
function point(p:Point){return Number(p.x.toFixed(2))+' '+Number(p.y.toFixed(2));}
function centerTrack(route:readonly FlowNode[]){return route.map((p,i)=>(i?'L ':'M ')+point(p)).join(' ');}
function laneSegment(a:FlowNode,b:FlowNode,offset=0){
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
  // Intersect the actual node rectangle (plus a small gap), rather than drawing through its text.
  const extent=Math.min(Math.abs(ux)>1e-6?63/Math.abs(ux):Infinity,Math.abs(uy)>1e-6?46/Math.abs(uy):Infinity,len*.45);
  const from={x:a.x+ux*extent+nx*offset,y:a.y+uy*extent+ny*offset};
  const to={x:b.x-ux*extent+nx*offset,y:b.y-uy*extent+ny*offset};
  return {from,to,angle:Math.atan2(dy,dx)*180/Math.PI,mid:{x:(from.x+to.x)/2,y:(from.y+to.y)/2}};
}
function lane(route:readonly FlowNode[],offset:number){return route.slice(1).map((b,i)=>laneSegment(route[i],b,offset));}
function motionTrack(segments:ReturnType<typeof lane>){
  return segments.map((s,i)=>(i?'L ':'M ')+point(s.from)+' L '+point(s.to)).join(' ');
}
export function FlowPacket({route,playing,speed,accent,animationKey,returnRoute,packetLabel,finalRoute}:{route:readonly FlowNode[];playing:boolean;speed:number;accent:string;animationKey:string;returnRoute?:readonly FlowNode[];packetLabel?:string;finalRoute?:readonly FlowNode[]}){
  if(route.length<2)return null;
  const forward=lane(route,returnRoute?.length?6:0);
  const backward=returnRoute?.length?lane(returnRoute,6):[];
  const final=finalRoute?.length?lane(finalRoute,6):[];
  const segments=[...forward,...backward,...final];
  const track=motionTrack(segments);
  const duration=(final.length?5.4:backward.length?4.8:3.2)/speed;
  const first=forward[0],vertical=Math.abs(first.from.y-first.to.y)>Math.abs(first.from.x-first.to.x);
  const labelX=first.mid.x+(vertical?35:0),labelY=first.mid.y-(vertical?0:24);
  return <g>
    <path data-flow-path d={centerTrack(route)} fill="none" stroke="none"/>
    {[...forward.map(s=>({s,color:accent,kind:'forward'})),...backward.map(s=>({s,color:'var(--blue)',kind:'return'}))].map(({s,color,kind},i)=><g key={i} data-lane={kind}>
      <path d={'M '+point(s.from)+' L '+point(s.to)} stroke={color} strokeWidth="8" opacity=".10" fill="none" strokeLinecap="round"/>
      <path data-visible-flow d={'M '+point(s.from)+' L '+point(s.to)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={kind==='return'?'5 3':undefined}/>
      <path data-flow-arrow={kind} d="M -8 -4.5 L 0 0 L -8 4.5" transform={'translate('+point(s.to)+') rotate('+s.angle+')'} fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
    </g>)}
    {playing&&<g className="request-packet-motion" key={animationKey+'-'+track}><circle r="10" fill={accent} opacity=".22"/><circle r="5" fill={accent} stroke="var(--bg)" strokeWidth="1.5"/><animateMotion dur={duration+'s'} path={track} calcMode="paced" repeatCount="1" fill="freeze"/></g>}
    {packetLabel&&<g transform={'translate('+labelX+' '+labelY+')'}><rect x="-30" y="-10" width="60" height="20" rx="6" fill="var(--bg)" stroke={accent} strokeOpacity=".6"/><text y="4" textAnchor="middle" fill={accent} fontSize="11" fontWeight="700" direction="ltr">{packetLabel}</text></g>}
  </g>;
}
export function FlowDiagram({nodes,edges,activeNodes,route,playing,speed,accent='var(--accent)',animationKey,label,caption,captionDirection='rtl',returnRoute,packetLabel,compactLayout,finalRoute}:{nodes:readonly FlowNode[];edges:readonly FlowEdge[];activeNodes:readonly number[];route:readonly FlowNode[];playing:boolean;speed:number;accent?:string;animationKey:string;label:string;caption:string;captionDirection?:'rtl'|'ltr';returnRoute?:readonly FlowNode[];packetLabel?:string;compactLayout?:{width:number;height:number;positions:readonly {x:number;y:number}[]};finalRoute?:readonly FlowNode[]}){
  const gridId=useId();
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
  const width=layout?.width??790,height=layout?.height??355;
  return <svg className="flow-diagram" data-layout={layout?'compact':'wide'} viewBox={'0 0 '+width+' '+height} direction="ltr" role="img" aria-label={label}>
    <defs><pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="var(--line)"/></pattern></defs>
    <rect width={width} height={height} rx="12" fill={'url(#'+gridId+')'} opacity=".65"/>
    {edges.map(([a,b])=>{const s=laneSegment(displayNodes[a],displayNodes[b]);return <line key={a+'-'+b} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke="var(--line)" strokeWidth="2" strokeDasharray="5 6"/>;})}
    <FlowPacket route={remap(route)} playing={playing} speed={speed} accent={accent} animationKey={animationKey} returnRoute={returnRoute?remap(returnRoute):undefined} finalRoute={finalRoute?remap(finalRoute):undefined} packetLabel={packetLabel}/>
    {displayNodes.map((node,i)=><DiagramNode key={i} node={node} active={activeNodes.includes(i)} accent={accent}/>)}
    <rect x={layout?12:190} y={height-54} width={layout?width-24:410} height="38" rx="9" fill="var(--bg)" stroke="var(--line)"/>
    <text x={width/2} y={height-30} fill={accent} textAnchor="middle" fontSize={layout?12.5:15} direction={captionDirection} fontWeight="600">{caption}</text>
  </svg>;
}
