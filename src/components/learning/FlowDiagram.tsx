import {useId,type ReactNode} from 'react';
export type FlowNode={x:number;y:number;label:string;sub:string;icon:string};
export type FlowEdge=readonly [number,number];
function NodeIcon({icon}:{icon:string}){
  const common={fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
  if(icon==='browser')return <g {...common}><rect x="-15" y="-11" width="30" height="22" rx="3"/><path d="M-15 -4 H15 M-10 -7 h1 M-6 -7 h1 M-2 -7 h1"/></g>;
  if(icon==='dns')return <g {...common}><circle r="13"/><ellipse rx="6" ry="13"/><path d="M-12 -5 H12 M-12 5 H12"/></g>;
  if(icon==='proxy')return <g {...common}><path d="M0 -14 L13 -7 V7 L0 14 L-13 7 V-7 Z M-13 -7 L0 0 L13 -7 M0 0 V14"/></g>;
  if(icon==='app')return <g {...common}><rect x="-14" y="-13" width="28" height="11" rx="2"/><rect x="-14" y="2" width="28" height="11" rx="2"/><path d="M-8 -7 h2 M-8 7 h2 M1 -7 h7 M1 7 h7"/></g>;
  return <g {...common}><ellipse cy="-9" rx="13" ry="5"/><path d="M-13 -9 V9 C-13 16 13 16 13 9 V-9 M-13 0 C-13 7 13 7 13 0"/></g>;
}

export function DiagramNode({node,active,accent,children}:{node:FlowNode;active:boolean;accent:string;children?:ReactNode}){
  return <g data-node={node.icon} transform={'translate('+node.x+' '+node.y+')'} style={{color:active?accent:'var(--muted)'}}><rect x="-59" y="-42" width="118" height="84" rx="15" fill={active?'var(--panel2)':'var(--bg)'} stroke={active?accent:'var(--line)'} strokeWidth={active?2:1.2}/><g transform="translate(0 -12)">{children??<NodeIcon icon={node.icon}/>}</g><text y="23" textAnchor="middle" fill={active?accent:'var(--ink)'} fontSize="14" direction="rtl" fontWeight="600">{node.label}</text><text y="62" textAnchor="middle" fill="var(--muted)" fontSize="12" direction="rtl">{node.sub}</text></g>;
}
export function FlowPacket({route,playing,speed,accent,animationKey}:{route:readonly FlowNode[];playing:boolean;speed:number;accent:string;animationKey:string}){
  if(route.length<2)return null;
  const track=route.map((node,i)=>(i?'L ':'M ')+node.x+' '+node.y).join(' ');
  return <g><path data-flow-path d={track} fill="none" stroke={accent} strokeWidth="3" opacity=".8"/>
    {playing&&<circle className="request-packet-motion" r="6" fill={accent} stroke="var(--bg)" strokeWidth="1.5"><animateMotion key={animationKey} dur={(1.8/speed)+'s'} path={track} repeatCount="indefinite"/></circle>}
    {route.slice(1).map((to,i)=>{const from=route[i];const x=(from.x+to.x)/2,y=(from.y+to.y)/2,angle=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI;return <path key={i} data-flow-arrow d="M -6 -5 L 6 0 L -6 5 Z" transform={'translate('+x+' '+y+') rotate('+angle+')'} fill={accent} className={playing?'request-packet-static':undefined}/>;})}
  </g>;
}
export function FlowDiagram({nodes,edges,activeNodes,route,playing,speed,accent='var(--accent)',animationKey,label,caption,captionDirection='rtl'}:{nodes:readonly FlowNode[];edges:readonly FlowEdge[];activeNodes:readonly number[];route:readonly FlowNode[];playing:boolean;speed:number;accent?:string;animationKey:string;label:string;caption:string;captionDirection?:'rtl'|'ltr'}){
  const gridId=useId();
  return <svg viewBox="0 0 790 355" direction="ltr" role="img" aria-label={label}>
    <defs><pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="var(--line)"/></pattern></defs>
    <rect width="790" height="355" fill={'url(#'+gridId+')'} opacity=".5"/>
    {edges.map(([a,b])=><line key={a+'-'+b} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--line)" strokeWidth="2" strokeDasharray="5 6"/>)}
    <FlowPacket route={route} playing={playing} speed={speed} accent={accent} animationKey={animationKey}/>
    {nodes.map((node,i)=><DiagramNode key={i} node={node} active={activeNodes.includes(i)} accent={accent}/>)}
    <rect x="190" y="301" width="410" height="38" rx="9" fill="var(--bg)" stroke="var(--line)"/>
    <text x="395" y="325" fill={accent} textAnchor="middle" fontSize="16" direction={captionDirection} fontWeight="600">{caption}</text>
  </svg>;
}
