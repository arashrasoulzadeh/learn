import {useEffect,useState,type ReactNode} from 'react';

type Step={title:string;detail:string};
type LabProps={
  title:string;
  label:string;
  steps:Step[];
  renderScene:(step:number,motion:boolean)=>ReactNode;
  alt:string;
};
const C={panel:'var(--panel2)',bg:'var(--bg)',line:'var(--line)',ink:'var(--ink)',muted:'var(--muted)',accent:'var(--accent)',danger:'var(--danger)',blue:'var(--blue)'};

function useReducedMotion(){
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    const sync=()=>setReduced(mq.matches);
    sync();mq.addEventListener('change',sync);return()=>mq.removeEventListener('change',sync);
  },[]);
  return reduced;
}
function LabFrame({title,label,steps,renderScene,alt}:LabProps){
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
  const reduced=useReducedMotion(),last=step===steps.length-1;
  useEffect(()=>{
    if(!playing)return;
    const id=window.setTimeout(()=>{if(last)setPlaying(false);else setStep(v=>v+1)},1800/speed);
    return()=>clearTimeout(id);
  },[playing,step,last,speed]);
  const jump=(n:number)=>{setPlaying(false);setStep(Math.max(0,Math.min(steps.length-1,n)))};
  return <section className="lab server-lab" aria-label={title}>
    <div className="lab-head"><h3>{title}</h3><span className="lab-label">{label}</span></div>
    <div className="lab-controls">
      <label>Speed<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
      <button className="primary" type="button" onClick={()=>{if(playing)setPlaying(false);else{if(last)setStep(0);setPlaying(true)}}}>{playing?'Pause':last?'Replay':'Play'}</button>
      <button className="secondary" type="button" onClick={()=>jump(step-1)} disabled={step===0}>←</button>
      <button className="secondary" type="button" onClick={()=>jump(step+1)} disabled={last}>→</button>
      <button className="secondary" type="button" onClick={()=>jump(0)}>Reset</button>
    </div>
    <svg className="lab-graph server-lab-graph" viewBox="0 0 760 390" role="img" aria-label={alt}>
      <defs><marker id="server-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={C.accent}/></marker></defs>
      {renderScene(step,playing&&!reduced)}
    </svg>
    <div className="lab-steps" aria-label="Jump to stage">{steps.map((s,i)=><button type="button" className="step-button" key={s.title} aria-current={step===i?'step':undefined} aria-label={s.title} title={s.title} onClick={()=>jump(i)}>{i+1}</button>)}</div>
    <div className="lab-stage" aria-live="polite"><small>STEP {step+1} OF {steps.length}</small><br/><strong>{steps[step].title}</strong><p>{steps[step].detail}</p></div>
    <p className="lab-caption">{reduced?'Reduced motion is enabled. Step changes remain available without moving packets.':'The numbers are an explicit teaching model. Use the arrows to inspect each state before playing the full sequence.'}</p>
  </section>;
}
type BoxProps={x:number;y:number;w:number;h:number;title:string;lines?:string[];active?:boolean;danger?:boolean;accent?:boolean};
function Box({x,y,w,h,title,lines=[],active=false,danger=false,accent=false}:BoxProps){
  const stroke=danger?C.danger:(active||accent)?C.accent:C.line;
  return <g><rect x={x} y={y} width={w} height={h} rx="13" fill={C.panel} stroke={stroke} strokeWidth={active?2.5:1.5}/><text x={x+w/2} y={y+27} textAnchor="middle" fill={danger?C.danger:(active||accent)?C.accent:C.ink} fontSize="15" fontWeight="700">{title}</text>{lines.map((line,i)=><text key={line+i} x={x+w/2} y={y+52+i*20} textAnchor="middle" fill={i===0?C.ink:C.muted} fontSize={i===0?"13":"11"} fontFamily={line.includes('/')||line.includes('=')||line.includes(':')||/\d/.test(line)?'ui-monospace, SFMono-Regular, Menlo, monospace':'inherit'}>{line}</text>)}</g>;
}
function Metric({x,y,label,value,bad=false}:{x:number;y:number;label:string;value:string;bad?:boolean}){
  return <g><text x={x} y={y} textAnchor="middle" fill={C.muted} fontSize="10">{label}</text><text x={x} y={y+23} textAnchor="middle" fill={bad?C.danger:C.accent} fontSize="17" fontWeight="700">{value}</text></g>;
}
function Flow({d,label,x,y,active=false,bad=false,motion=false}:{d:string;label?:string;x?:number;y?:number;active?:boolean;bad?:boolean;motion?:boolean}){
  const stroke=bad?C.danger:active?C.accent:C.line;
  return <g><path d={d} fill="none" stroke={stroke} strokeWidth={active?2.7:1.6} strokeDasharray={active?undefined:'5 6'} markerEnd={active?'url(#server-arrow)':undefined}/>{label&&<text x={x} y={y} textAnchor="middle" fill={bad?C.danger:active?C.accent:C.muted} fontSize="11" fontWeight={active?'700':'500'}>{label}</text>}{active&&<circle r="5" fill={bad?C.danger:C.accent}>{motion?<animateMotion dur="1.15s" path={d} repeatCount="indefinite"/>:<animateMotion dur="0.01s" path={d} begin="0s" fill="freeze"/>}</circle>}</g>;
}
function Pill({x,y,text,bad=false}:{x:number;y:number;text:string;bad?:boolean}){
  const w=Math.max(70,text.length*7+20);
  return <g><rect x={x-w/2} y={y-17} width={w} height={28} rx="14" fill={C.bg} stroke={bad?C.danger:C.accent}/><text x={x} y={y+2} textAnchor="middle" fill={bad?C.danger:C.accent} fontSize="11" fontWeight="700">{text}</text></g>;
}
function Bar({x,y,w,value,label,bad=false}:{x:number;y:number;w:number;value:number;label:string;bad?:boolean}){
  return <g><rect x={x} y={y} width={w} height="10" rx="5" fill={C.bg}/><rect x={x} y={y} width={w*Math.max(0,Math.min(1,value))} height="10" rx="5" fill={bad?C.danger:C.accent}/><text x={x+w/2} y={y+27} textAnchor="middle" fill={C.muted} fontSize="10">{label}</text></g>;
}

const lbSteps:Step[]=[
 {title:'Physical capacity first',detail:'Two healthy servers can each process 4 requests/s. Ten incoming requests/s means physical capacity is 8/s, so 2/s must wait or be rejected. A routing algorithm cannot manufacture capacity.'},
 {title:'Round Robin rotates eligible targets',detail:'Round Robin alternates S1 and S2. At 10 requests/s the distribution is balanced, but both servers still stop at 4/s and two requests remain unserved.'},
 {title:'Weight changes ratio, not capacity',detail:'A 2:1 weight selects S1 more often. Unless S1 really has more physical capacity, the total remains 8/s. Weight is a routing hint, not extra CPU.'},
 {title:'Least Connections follows active work',detail:'When S1 already has three active requests and S2 has one, Least Connections chooses S2. It reacts to current work rather than a fixed turn.'},
 {title:'Strict affinity can waste headroom',detail:'User A is pinned to S1. If S1 is full while S2 is idle, strict affinity can reject A instead of using S2. Headroom exists but policy prevents using it.'},
 {title:'Scale-out adds real capacity',detail:'Adding S3 at 4/s raises physical capacity from 8/s to 12/s. The same 10 requests/s now fit. This is a capacity change, unlike changing strategy.'}
];
export function LoadBalancingLab(){
 return <LabFrame title="Load balancing: routing versus capacity" label="SERVER LAB / 01" steps={lbSteps} alt="Load balancer distributing ten requests per second across servers" renderScene={(s,m)=>{
   const count=s===5?3:2,cap=count*4,accepted=Math.min(10,cap),rejected=10-accepted;
   const strategy=['Capacity model','Round Robin','Weighted 2:1','Least Connections','IP Hash / strict affinity','Round Robin + S3'][s];
   const loads=s===0?[4,4,0]:s===1?[4,4,0]:s===2?[4,4,0]:s===3?[3,1,0]:s===4?[4,0,0]:[4,3,3];
   return <><Box x={25} y={110} w={120} h={120} title="Incoming" lines={['10 req/s',strategy]} active/><Box x={190} y={105} w={145} h={130} title="Load Balancer" lines={[strategy,s===4?'A → S1':'healthy targets'] } accent/>
    {[0,1,2].slice(0,count).map((i)=><g key={i}><Box x={410} y={35+i*105} w={140} h={80} title={'S'+(i+1)} lines={[s===4&&i===1?'load 0/4':'load '+loads[i]+'/4','capacity 4/s']} active={s===3?i===1:s===4?i===0:true} danger={s===4&&i===0}/><Bar x={430} y={91+i*105} w={100} value={loads[i]/4} label={(loads[i]/4*100).toFixed(0)+'%'} bad={loads[i]>=4}/></g>)}
    <Flow d="M145 170 L190 170" label="requests" x={167} y={158} active motion={m}/><Flow d="M335 155 L410 75" active={s!==4||true} motion={m}/><Flow d="M335 175 L410 180" active={s!==4} motion={m}/>{count===3&&<Flow d="M335 190 L410 285" active motion={m}/>}
    {s===4&&<Pill x={625} y={95} text="S1 FULL" bad/>}{s===4&&<Pill x={625} y={185} text="S2 has 4/s headroom"/>}
    <Metric x={625} y={255} label="PHYSICAL CAPACITY" value={cap+' req/s'}/><Metric x={625} y={310} label="ACCEPTED / REJECTED" value={accepted+' / '+rejected} bad={rejected>0}/></>;
 }}/>;
}

const replSteps:Step[]=[
 {title:'Start in sync',detail:'Primary and Replica have both applied version 42. The replication log is empty, so lag is zero.'},
 {title:'Commit on Primary first',detail:'A write commits version 43 on Primary. In asynchronous replication the client can receive success before Replica has applied that change.'},
 {title:'A Replica read can be stale',detail:'Primary is at v43 while Replica is still v42. A read routed to Replica cannot see the just-committed change yet.'},
 {title:'Apply closes the version gap',detail:'The pending change is applied on Replica. Both sides reach v43 and lag returns to zero.'},
 {title:'Delay creates bounded lag',detail:'At 6 writes/s with apply capacity 8/s and a 2-second delay, roughly 12 changes can remain pending even though Replica has enough throughput.'},
 {title:'Overload makes lag grow',detail:'At 12 writes/s with apply capacity 8/s, about 4 changes/s accumulate after warm-up. This is saturation, not merely transport delay.'},
 {title:'Lower traffic allows catch-up',detail:'When writes drop to 2/s while apply capacity stays 8/s, the spare 6/s drains backlog until Replica catches up.'}
];
export function ReplicationLab(){
 return <LabFrame title="Replication: committed, pending, applied" label="SERVER LAB / 02" steps={replSteps} alt="Primary, replication log and replica versions" renderScene={(s,m)=>{
   const states=[
    [42,0,42,'lag 0'],[43,1,42,'lag 1'],[43,1,42,'stale read: v42'],[43,0,43,'lag 0'],[60,12,48,'bounded lag'],[88,28,60,'lag growing +4/s'],[96,4,92,'catching up']
   ] as const;const [p,pending,r,note]=states[s];
   return <><Box x={45} y={115} w={165} h={115} title="Primary" lines={['v'+p,s>=4?(s===5?'write 12/s':s===6?'write 2/s':'write 6/s'):'committed state']} active={s===1||s===5}/><Box x={295} y={115} w={170} h={115} title="Replication Log" lines={[pending+' pending',s>=4?'delay / backlog':'ordered changes']} active={pending>0} danger={s===5}/><Box x={550} y={115} w={165} h={115} title="Replica" lines={['v'+r,s>=4?'apply cap 8/s':'applied state']} active={s===3||s===6}/>
    <Flow d="M210 172 L295 172" label={s===1?'commit v43':'change'} x={252} y={158} active={s===1||s>=4} motion={m}/><Flow d="M465 172 L550 172" label="apply" x={507} y={158} active={s===3||s>=4} motion={m}/>
    {s===2&&<><Box x={560} y={275} w={145} h={65} title="Reader" lines={['sees v42']} active/><Flow d="M632 275 L632 230" active motion={m}/></>}
    <Metric x={380} y={280} label="REPLICATION LAG" value={pending+' changes'} bad={s===5}/><Pill x={380} y={335} text={note} bad={s===5}/></>;
 }}/>;
}

const proxySteps:Step[]=[
 {title:'Receive one concrete request',detail:'The client sends GET /api/orders to the public HTTPS endpoint. Internal service addresses are not part of the client contract.'},
 {title:'Terminate TLS and inspect HTTP metadata',detail:'The proxy decrypts the connection at the edge and can read the Host and Path needed for routing. It does not own order business rules.'},
 {title:'Match the routing rule',detail:'The route table matches /api/* and selects the API upstream. /app/* would select Web instead.'},
 {title:'Forward and relay the response',detail:'The proxy forwards the same request to API :8080. API returns 200 OK, and the proxy relays that response to the client.'},
 {title:'Map an upstream connection failure',detail:'If the route still points to API but the connection fails, the edge can return 502 Bad Gateway. The route decision and the upstream health are separate facts.'}
];
export function ReverseProxyLab(){
 return <LabFrame title="Reverse proxy: inspect, match, forward" label="SERVER LAB / 03" steps={proxySteps} alt="GET /api/orders passing through a reverse proxy" renderScene={(s,m)=><>
   <Box x={25} y={75} w={190} h={170} title="Client request" lines={['GET /api/orders','Host: api.example.com','HTTPS :443']} active={s===0}/>
   <Box x={285} y={65} w={205} h={190} title="Reverse Proxy" lines={['public :443','/api/* → API','/app/* → Web',s>=1?'Host + Path visible':'TLS edge']} active={s===1||s===2} accent/>
   <Box x={555} y={55} w={170} h={90} title="API" lines={[':8080',s===4?'CONNECT FAIL':'200 OK']} active={s===3} danger={s===4}/>
   <Box x={555} y={190} w={170} h={70} title="Web" lines={[':3000']}/>
   <Flow d="M215 155 L285 155" label="GET /api/orders" x={250} y={140} active={s===0} motion={m}/>
   <Flow d="M490 135 L555 100" label="/api/*" x={525} y={102} active={s===2||s===3||s===4} bad={s===4} motion={m}/>
   {s===1&&<Pill x={387} y={300} text="TLS ✓ · read Host + Path"/>}
   {s===2&&<Pill x={387} y={300} text="MATCH /api/* → API"/>}
   {s===3&&<><Flow d="M555 125 L490 205 L285 205 L215 205" label="200 OK" x={390} y={192} active motion={m}/><Pill x={640} y={300} text="API handled business logic"/></>}
   {s===4&&<><Flow d="M285 215 L215 215" label="502 Bad Gateway" x={250} y={245} active bad motion={m}/><Pill x={640} y={300} text="upstream connect error" bad/></>}
 </>}/>;
}

const hsSteps:Step[]=[
 {title:'Measure one saturated instance',detail:'Traffic is 12 req/s. App 1 can serve 4/s, so 8/s overflow before any scaling decision.'},
 {title:'Add App 2',detail:'A second identical instance raises App-tier capacity to 8/s. That is real extra capacity, but 4/s still exceed the tier.'},
 {title:'Balance work across two instances',detail:'The load balancer sends roughly 4/s to each App. Both are full; the remaining 4/s still have nowhere to go.'},
 {title:'Add App 3 and clear the App queue',detail:'Three instances provide 12/s of App capacity, matching the incoming workload. App-tier overflow becomes zero.'},
 {title:'Find the next shared bottleneck',detail:'All three Apps use one database capped at 10 queries/s. End-to-end throughput is now limited downstream, even though App capacity is 12/s.'}
];
export function HorizontalScalingLab(){
 return <LabFrame title="Horizontal scaling: add instances, then re-measure" label="SERVER LAB / 04" steps={hsSteps} alt="Twelve requests per second distributed across three four-request-per-second application instances" renderScene={(s,m)=>{
   const apps=s===0?1:s<3?2:3;const appCap=apps*4;const appAccepted=Math.min(12,appCap);const endAccepted=s===4?10:appAccepted;
   return <><Box x={25} y={125} w={125} h={100} title="Incoming" lines={['12 req/s']} active/><Box x={190} y={115} w={135} h={120} title="Load Balancer" lines={['healthy Apps',apps+' targets']} accent/>
    {[0,1,2].slice(0,apps).map(i=><Box key={i} x={385} y={35+i*105} w={145} h={78} title={'App '+(i+1)} lines={['capacity 4/s','load '+(s>=2||i===0?'4/4':i===1?'4/4':'0/4')]} active={s===1&&i===1||s===3&&i===2}/>)}
    <Box x={590} y={125} w={135} h={100} title="Shared DB" lines={['capacity 10 q/s',s===4?'10/10':'load '+Math.min(appAccepted,10)+'/10']} active={s===4} danger={s===4}/>
    <Flow d="M150 175 L190 175" active motion={m}/>{[0,1,2].slice(0,apps).map(i=><Flow key={i} d={'M325 175 L385 '+(74+i*105)} active={s>=2||i===0} motion={m}/>)}
    {s===4&&[0,1,2].map(i=><Flow key={'d'+i} d={'M530 '+(74+i*105)+' L590 175'} active motion={m}/>)}
    <Metric x={225} y={300} label="APP CAPACITY" value={appCap+' req/s'}/><Metric x={390} y={300} label="APP OVERFLOW" value={Math.max(0,12-appCap)+' req/s'} bad={12>appCap}/><Metric x={610} y={300} label="END-TO-END ACCEPTED" value={endAccepted+' req/s'} bad={s===4}/></>;
 }}/>;
}

const vsSteps:Step[]=[
 {title:'Measure the small host',detail:'The same 8 req/s workload runs on 2 CPU / 8 GB. CPU is 96% and modeled service capacity is 4 req/s, so half the workload overflows.'},
 {title:'Resize the same machine',detail:'Scale-up changes the existing host to 8 CPU / 32 GB. No new instance or failure domain is created.'},
 {title:'Measure the performance change',detail:'Modeled capacity becomes 12 req/s. The 8 req/s workload now fits, and P99 falls from 240 ms to 70 ms in this explicit teaching model.'},
 {title:'Count failure domains again',detail:'There is still one host and one local volume. More headroom did not create redundancy.'},
 {title:'Fail the host',detail:'If that single host goes down, available App capacity becomes zero. Vertical scaling improved capacity, not availability.'}
];
export function VerticalScalingLab(){
 return <LabFrame title="Vertical scaling: bigger host, same failure domain" label="SERVER LAB / 05" steps={vsSteps} alt="One application host resized from two CPUs to eight CPUs while workload stays constant" renderScene={(s,m)=>{
   const upgraded=s>=1,down=s===4;
   return <><Box x={30} y={130} w={130} h={95} title="Workload" lines={['8 req/s','constant']} active/><Box x={240} y={65} w={250} h={190} title={down?'App Host · DOWN':'App Host'} lines={upgraded?['8 CPU · 32 GB','capacity 12 req/s',s>=2?'P99 70 ms':'same Host ID']:['2 CPU · 8 GB','CPU 96%','capacity 4 req/s']} active={s===1||s===2} danger={down} accent/><Box x={570} y={120} w={145} h={105} title="Local State" lines={['volume A','same host']} active={s===3||s===4} danger={down}/>
    <Flow d="M160 177 L240 177" label="8/s" x={200} y={163} active={!down} motion={m}/><Flow d="M490 177 L570 177" active={!down&&s>=3} motion={m}/>
    <Metric x={300} y={315} label="SERVED / OVERFLOW" value={down?'0 / 8':upgraded?'8 / 0':'4 / 4'} bad={down||!upgraded}/><Metric x={520} y={315} label="FAILURE DOMAINS" value="1" bad={s>=3}/></>;
 }}/>;
}

const healthSteps:Step[]=[
 {title:'App 2 is ready',detail:'The load balancer calls GET /ready. App 2 can reach its critical database and returns 200 READY, so it remains in the routing set.'},
 {title:'The database fails while the process stays alive',detail:'Critical DB becomes unavailable. The App 2 process is still running, so process liveness and ability to serve traffic have diverged.'},
 {title:'Separate /live from /ready',detail:'App 2 can return /live 200 but /ready 503 because a critical dependency required to serve requests is unavailable.'},
 {title:'Remove the unready target',detail:'The load balancer updates the ready set from [App1, App2] to [App1]. No restart is required to make that routing decision.'},
 {title:'Route user traffic only to ready targets',detail:'The next user request goes to App 1 and succeeds. Readiness protected traffic from a process that was alive but unable to serve correctly.'}
];
export function HealthChecksLab(){
 return <LabFrame title="Health checks: alive is not ready" label="SERVER LAB / 06" steps={healthSteps} alt="Load balancer using readiness checks to remove an application with a failed database dependency" renderScene={(s,m)=>{
   const dbDown=s>=1,app2Ready=s<2,removed=s>=3;
   return <><Box x={25} y={120} w={155} h={120} title="Load Balancer" lines={['ready set',removed?'[App1]':'[App1, App2]']} active={s===3}/><Box x={280} y={55} w={165} h={90} title="App 1" lines={['/live 200','/ready 200']} active={s===4}/><Box x={280} y={205} w={165} h={105} title="App 2" lines={['/live 200','/ready '+(app2Ready?'200':'503')]} active={s===0||s===2} danger={!app2Ready}/><Box x={560} y={205} w={150} h={100} title="Critical DB" lines={[dbDown?'DOWN':'SELECT 1 OK']} danger={dbDown} active={s===1}/>
    <Flow d="M180 190 L280 257" label="GET /ready" x={230} y={238} active={s===0} motion={m}/><Flow d="M445 257 L560 257" label="SELECT 1" x={502} y={242} active={s===0||s===1} bad={dbDown} motion={m}/>{s===4&&<Flow d="M180 165 L280 100" label="user request" x={230} y={120} active motion={m}/>}
    {s===0&&<Pill x={365} y={345} text="200 READY"/>}{s===2&&<><Pill x={335} y={345} text="/live 200"/><Pill x={500} y={345} text="/ready 503" bad/></>}{s===4&&<Pill x={365} y={345} text="200 OK"/>}</>;
 }}/>;
}

const discoverySteps:Step[]=[
 {title:'Resolve a stable service name',detail:'Checkout depends on orders.service, not on one machine IP. It asks the registry or DNS-like system for current endpoints.'},
 {title:'Receive an endpoint set with a TTL',detail:'The response contains 10.0.0.12:443 and 10.0.0.19:443 with a 30-second TTL. These addresses are runtime data, not the service identity.'},
 {title:'Dial one concrete endpoint',detail:'Checkout dials 10.0.0.12:443 and connects successfully. The logical name has now become a network connection to one instance.'},
 {title:'Observe a stale cached endpoint fail',detail:'10.0.0.12 disappears before the cached result refreshes. A stale dial returns ECONNREFUSED even though orders.service still exists.'},
 {title:'Refresh and connect to the replacement',detail:'A fresh resolve includes 10.0.0.27:443. Checkout dials the replacement without changing its source-level dependency name.'}
];
export function ServiceDiscoveryLab(){
 return <LabFrame title="Service discovery: stable name, changing endpoints" label="SERVER LAB / 07" steps={discoverySteps} alt="Checkout resolving orders.service to changing IP endpoints" renderScene={(s,m)=><>
   <Box x={25} y={120} w={160} h={120} title="Checkout" lines={['needs Orders','orders.service:443']} active={s===0}/><Box x={270} y={70} w={210} h={205} title="Service Registry" lines={['orders.service',s===0?'resolving…':'10.0.0.12:443',s===0?'':'10.0.0.19:443',s>=4?'10.0.0.27:443':'TTL 30s']} active={s===1||s===4}/><Box x={565} y={65} w={160} h={85} title="Orders A" lines={['10.0.0.12:443',s>=3?'REMOVED':'healthy']} danger={s>=3} active={s===2}/><Box x={565} y={225} w={160} h={85} title="Orders C" lines={['10.0.0.27:443',s>=4?'healthy':'not registered']} active={s===4}/>
   <Flow d="M185 180 L270 180" label="resolve" x={227} y={165} active={s===0||s===4} motion={m}/><Flow d="M480 145 L565 108" label="dial .12" x={523} y={112} active={s===2||s===3} bad={s===3} motion={m}/>{s===4&&<Flow d="M480 210 L565 267" label="dial .27" x={523} y={253} active motion={m}/>}
   {s===1&&<Pill x={375} y={325} text="2 endpoints · TTL 30s"/>}{s===2&&<Pill x={645} y={175} text="CONNECTED"/>}{s===3&&<Pill x={645} y={175} text="ECONNREFUSED" bad/>}{s===4&&<Pill x={645} y={345} text="CONNECTED"/>}</>}/>;
}

const poolSteps:Step[]=[
 {title:'See the cost without a pool',detail:'Every request opens TCP, performs TLS/authentication and creates a database session before it can query. Connection setup becomes part of request latency.'},
 {title:'Open four warm connections once',detail:'The pool creates four bounded database connections. The database sees four sessions instead of one new session per HTTP request.'},
 {title:'Request A borrows and returns slot #1',detail:'A borrows connection #1, executes SELECT, then returns that exact connection to the pool. The connection remains open and reusable.'},
 {title:'Request B reuses slot #1',detail:'B borrows the warm connection from the pool and skips another handshake. Reuse reduces setup work while keeping the connection count bounded.'},
 {title:'Request E waits when the pool is full',detail:'All four slots are busy. E waits or times out according to pool policy instead of opening connection #5 and exceeding the configured budget.'}
];
export function ConnectionPoolingLab(){
 return <LabFrame title="Connection pooling: borrow, query, return, reuse" label="SERVER LAB / 08" steps={poolSteps} alt="Five requests sharing four numbered database connections" renderScene={(s,m)=><>
   <Box x={20} y={105} w={150} h={135} title="HTTP Requests" lines={['A  B  C  D  E',s===4?'E waiting':'arriving'] } active={s===0||s===4}/><Box x={240} y={65} w={260} h={210} title="Connection Pool" lines={['4 warm DB connections','[#1] [#2] [#3] [#4]',s===2?'A → #1 → return':s===3?'B → reuse #1':s===4?'all 4 busy':'bounded slots']} active={s>=1} accent/><Box x={585} y={105} w={145} h={135} title="Database" lines={['max 100',s===0?'new sessions':'active: 4']} active={s===0||s===1}/>
   {s===0?<Flow d="M170 170 L585 170" label="TCP + TLS + auth" x={377} y={154} active motion={m}/>:<><Flow d="M170 170 L240 170" label={s===4?'E waits':'borrow'} x={205} y={155} active={s>=2} motion={m}/><Flow d="M500 170 L585 170" label={s===4?'4 open':'query'} x={542} y={155} active={s>=1} motion={m}/></>}
   {s===2&&<Pill x={370} y={315} text="A returns #1"/>}{s===3&&<Pill x={370} y={315} text="B reuses #1"/>}{s===4&&<Pill x={370} y={315} text="POOL FULL · E waits" bad/>}</>}/>;
}

const failoverSteps:Step[]=[
 {title:'Commit through a stable endpoint',detail:'The client sends INSERT through db.internal. Primary and Replica are both at LSN 120; the current Primary is the only writable node.'},
 {title:'Detect that the Primary stopped responding',detail:'The next write times out. Detection establishes that the current writer is unavailable, but detection alone does not make a safe new writer.'},
 {title:'Fence the old writer',detail:'Fencing prevents the old Primary from accepting writes if it reappears. This is the safety step that prevents two writable Primaries.'},
 {title:'Promote a sufficiently fresh Replica',detail:'Replica is at LSN 120, matching the last known committed position in this scenario. It becomes the only writable Primary.'},
 {title:'Move the stable endpoint and retry',detail:'db.internal now points to the promoted node. The client retries the INSERT and receives COMMIT OK without learning a new database hostname.'}
];
export function FailoverLab(){
 return <LabFrame title="Failover: detect, fence, promote, reroute" label="SERVER LAB / 09" steps={failoverSteps} alt="Database failover with a stable endpoint, fencing and LSN checks" renderScene={(s,m)=><>
   <Box x={25} y={125} w={130} h={105} title="Client" lines={['INSERT','db.internal']} active={s===0||s===4}/><Box x={210} y={125} w={150} h={105} title="db.internal" lines={[s===4?'→ New Primary':'→ Primary']} active={s===4} accent/><Box x={450} y={45} w={220} h={105} title={s>=2?'Old Primary':'Primary'} lines={['LSN 120',s>=2?'FENCED':s===1?'NO RESPONSE':'WRITABLE']} danger={s===1||s>=2} active={s===1||s===2}/><Box x={450} y={230} w={220} h={105} title={s>=3?'New Primary':'Replica'} lines={['LSN 120',s>=3?'WRITABLE':'READ ONLY']} active={s===3||s===4} accent={s>=3}/>
   <Flow d="M155 177 L210 177 L450 97" label="INSERT" x={330} y={115} active={s===0||s===1} bad={s===1} motion={m}/>{s===4&&<Flow d="M155 195 L210 195 L450 282" label="retry INSERT" x={330} y={250} active motion={m}/>}
   {s===0&&<Pill x={560} y={185} text="COMMIT OK"/>}{s===1&&<Pill x={285} y={270} text="write timeout" bad/>}{s===2&&<Pill x={560} y={185} text="OLD WRITER FENCED" bad/>}{s===3&&<Pill x={560} y={370} text="PROMOTED"/>}{s===4&&<Pill x={285} y={270} text="COMMIT OK"/>}</>}/>;
}

const affinitySteps:Step[]=[
 {title:'Set an affinity cookie on the first request',detail:'User A arrives without an affinity cookie. The load balancer chooses App 1 and returns Set-Cookie: route=app1.'},
 {title:'Return the next request to App 1',detail:'The browser sends route=app1. The balancer selects App 1, which finds local session A with cart=3.'},
 {title:'Measure load skew',detail:'Sticky users accumulate unevenly. App 1 reaches 90% load while App 2 remains at 30%, even though the fleet average looks comfortable.'},
 {title:'Fail the sticky target',detail:'App 1 goes down. The cookie still names app1, but local session A disappeared with that process. Affinity did not make session state durable.'},
 {title:'Move session state outside the instance',detail:'With a shared session store, the balancer can send User A to App 2. App 2 reads session A and returns cart=3, so routing is no longer coupled to one process.'}
];
export function SessionAffinityLab(){
 return <LabFrame title="Session affinity: routing locality versus durable state" label="SERVER LAB / 10" steps={affinitySteps} alt="User affinity cookie routing to App 1 and later recovering session state on App 2" renderScene={(s,m)=><>
   <Box x={20} y={115} w={150} h={125} title="User A" lines={['GET /cart',s>=1?'cookie: route=app1':'cookie: —']} active={s===0||s===1}/><Box x={225} y={105} w={165} h={145} title="Load Balancer" lines={['affinity cookie',s===4?'fallback → App2':'route=app1']} active={s===0||s===4} accent/><Box x={475} y={40} w={210} h={105} title="App 1" lines={[s>=3?'DOWN':'session A: cart=3',s===2?'load 90%':'local state']} danger={s>=3} active={s===1||s===2}/><Box x={475} y={215} w={210} h={105} title="App 2" lines={[s===4?'cart=3 via Shared Store':'no local session A',s===2?'load 30%':'healthy']} active={s===4}/>{s===4&&<Box x={225} y={285} w={165} h={70} title="Shared Session Store" lines={['A → cart=3']} active/>}
   <Flow d="M170 177 L225 177 L475 92" label={s===0?'first request':'sticky'} x={335} y={112} active={s<=3} bad={s===3} motion={m}/>{s===4&&<><Flow d="M170 195 L225 195 L475 267" label="route App2" x={335} y={260} active motion={m}/><Flow d="M475 290 L390 320" label="read A" x={430} y={330} active motion={m}/></>}
   {s===0&&<Pill x={307} y={290} text="Set-Cookie: route=app1"/>}{s===1&&<Pill x={580} y={180} text="cart=3 found"/>}{s===2&&<Pill x={580} y={180} text="LOAD SKEW" bad/>}{s===3&&<Pill x={307} y={290} text="session unavailable" bad/>}</>}/>;
}
