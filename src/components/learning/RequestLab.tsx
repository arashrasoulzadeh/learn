import { useState, useEffect } from 'react';

const stages = [
  {name:'Prepare the request',short:'Browser',from:0,to:0,label:'URL → request intent',detail:'The browser parses the URL, chooses a method and checks its cache. This simulation assumes a cache miss and a new connection.'},
  {name:'Resolve the hostname',short:'DNS',from:0,to:1,label:'DNS lookup → IP address',detail:'A DNS resolver looks up the IP address for the hostname and returns it. The URL path is not part of DNS. Cached answers may avoid a new lookup.'},
  {name:'Open a TCP connection',short:'TCP',from:0,to:2,label:'SYN → SYN-ACK → ACK',detail:'The client and server perform the three-way handshake to establish a reliable byte stream.'},
  {name:'Secure the connection',short:'TLS',from:0,to:2,label:'TLS handshake',detail:'The client verifies the server certificate and negotiates encryption keys. HTTPS protects HTTP messages in transit.'},
  {name:'Send the HTTP request',short:'Request',from:0,to:2,label:'Encrypted HTTP request',detail:'The request contains a method, path, headers and sometimes a body. The edge proxy receives the request.'},
  {name:'Run application logic',short:'Application',from:2,to:3,label:'Proxy → route → handler',detail:'The proxy forwards the request to the application, which matches a route, checks access, validates input and runs business logic.'},
  {name:'Access the data',short:'Database',from:3,to:4,label:'Read / write → result',detail:'The application queries a database or cache if needed. Some requests do not need data access.'},
  {name:'Return the HTTP response',short:'Response',from:3,to:0,label:'Status + headers + body',detail:'The application returns its result through the proxy to the browser. The status code describes the outcome.'},
  {name:'Update the browser',short:'Render',from:0,to:0,label:'Parse → update UI',detail:'The browser or JavaScript client parses the response, updates the interface and may cache eligible responses.'}
];
const nodes = [
  {x:90,y:220,label:'Browser',sub:'Client',icon:'browser'},
  {x:290,y:78,label:'DNS resolver',sub:'Name → IP',icon:'dns'},
  {x:290,y:220,label:'Edge / proxy',sub:'Connection',icon:'proxy'},
  {x:495,y:220,label:'Application',sub:'Business logic',icon:'app'},
  {x:700,y:220,label:'Database',sub:'Storage',icon:'db'}
];
const scenarios = {
  get:{method:'GET',path:'/api/products/42',status:'200 OK',body:'{"id":42,"name":"Keyboard"}'},
  post:{method:'POST',path:'/api/products',status:'201 Created',body:'{"id":43,"name":"Mouse"}'},
  missing:{method:'GET',path:'/api/products/999',status:'404 Not Found',body:'{"error":"Product not found"}'},
  error:{method:'GET',path:'/api/products/42',status:'500 Internal Server Error',body:'{"error":"Unexpected server error"}'}
};
type Scenario = keyof typeof scenarios;
function NodeIcon({icon}:{icon:string}){
  const common={fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
  if(icon==='browser')return <g {...common}><rect x="-15" y="-11" width="30" height="22" rx="3"/><path d="M-15 -4 H15 M-10 -7 h1 M-6 -7 h1 M-2 -7 h1"/></g>;
  if(icon==='dns')return <g {...common}><circle r="13"/><ellipse rx="6" ry="13"/><path d="M-12 -5 H12 M-12 5 H12"/></g>;
  if(icon==='proxy')return <g {...common}><path d="M0 -14 L13 -7 V7 L0 14 L-13 7 V-7 Z M-13 -7 L0 0 L13 -7 M0 0 V14"/></g>;
  if(icon==='app')return <g {...common}><rect x="-14" y="-13" width="28" height="11" rx="2"/><rect x="-14" y="2" width="28" height="11" rx="2"/><path d="M-8 -7 h2 M-8 7 h2 M1 -7 h7 M1 7 h7"/></g>;
  return <g {...common}><ellipse cy="-9" rx="13" ry="5"/><path d="M-13 -9 V9 C-13 16 13 16 13 9 V-9 M-13 0 C-13 7 13 7 13 0"/></g>;
}
export default function RequestLab(){
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[scenario,setScenario]=useState<Scenario>('get');
  const s=scenarios[scenario], stage=stages[step], last=step===stages.length-1;
  useEffect(()=>{
    if(!playing)return;
    const id=window.setTimeout(()=>{if(last)setPlaying(false);else setStep(v=>v+1);},3000/speed);
    return()=>window.clearTimeout(id);
  },[playing,step,speed,last]);
  const jump=(n:number)=>{setPlaying(false);setStep(Math.max(0,Math.min(stages.length-1,n)));};
  const from=nodes[stage.from],to=nodes[stage.to];
  const track=step===7?'M 495 220 L 290 220 L 90 220':'M '+from.x+' '+from.y+' L '+to.x+' '+to.y;
  const activeNodes=step===7?[0,2,3]:[stage.from,stage.to];
  const accent=step>=7&&(scenario==='missing'||scenario==='error')?'var(--danger)':'var(--accent)';
  const requestBody=s.method==='POST'?'{"name":"Mouse"}':'';
  const request=s.method+' '+s.path+' HTTP/1.1\nHost: shop.example\nAccept: application/json'+(requestBody?'\nContent-Type: application/json\nContent-Length: '+requestBody.length+'\n\n'+requestBody:'\n');
  const response='HTTP/1.1 '+s.status+'\nContent-Type: application/json\nContent-Length: '+s.body.length+'\nCache-Control: no-store\n\n'+s.body;
  return <section className="request-experience" aria-label="Interactive HTTP request lesson">
    <div className="request-toolbar">
      <div className="lab-controls">
        <label>Scenario<select value={scenario} onChange={e=>{setScenario(e.target.value as Scenario);jump(0);}}><option value="get">GET · 200 OK</option><option value="post">POST · 201 Created</option><option value="missing">GET · 404 Not Found</option><option value="error">GET · 500 Server Error</option></select></label>
        <label>Speed<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
        <button className="primary" type="button" onClick={()=>{if(playing)setPlaying(false);else{if(last)setStep(0);setPlaying(true);}}}>{playing?'❚❚ Pause':last?'↻ Replay':'▶ Play'}</button>
        <button className="secondary" type="button" aria-label="Previous step" onClick={()=>jump(step-1)} disabled={step===0}>←</button>
        <button className="secondary" type="button" aria-label="Next step" onClick={()=>jump(step+1)} disabled={last}>→</button>
        <button className="secondary" type="button" onClick={()=>jump(0)}>Reset</button>
      </div>
      <span className="request-counter">STEP {String(step+1).padStart(2,'0')} / {String(stages.length).padStart(2,'0')}</span>
    </div>
    <div className="request-canvas">
      <svg viewBox="0 0 790 355" role="img" aria-label={stage.name}>
        <defs><pattern id="request-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="var(--line)"/></pattern><marker id="request-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6Z" fill={accent}/></marker></defs>
        <rect width="790" height="355" fill="url(#request-grid)" opacity=".8"/>
        {[[0,1],[0,2],[2,3],[3,4]].map(([a,b])=><line key={a+'-'+b} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--line)" strokeWidth="2" strokeDasharray="5 6"/>)}
        {stage.from!==stage.to&&<g><path d={track} fill="none" stroke={accent} strokeWidth="3" opacity=".8"/>{playing&&<circle className="request-packet-motion" r="6" fill={accent}><animateMotion key={step+'-'+scenario+'-'+speed} dur={(1.8/speed)+'s'} path={track} repeatCount="indefinite"/></circle>}<circle className={playing?'request-packet-static':undefined} cx={(from.x+to.x)/2} cy={(from.y+to.y)/2} r="5" fill={accent}/></g>}
        {nodes.map((n,i)=>{const active=activeNodes.includes(i);return <g key={n.label} transform={'translate('+n.x+' '+n.y+')'} style={{color:active?accent:'var(--muted)'}}><rect x="-59" y="-42" width="118" height="84" rx="13" fill="var(--bg)" stroke={active?accent:'var(--line)'} strokeWidth={active?2:1.2}/><g transform="translate(0 -10)"><NodeIcon icon={n.icon}/></g><text y="23" textAnchor="middle" fill={active?accent:'var(--ink)'} fontSize="12" fontWeight="600">{n.label}</text><text y="62" textAnchor="middle" fill="var(--muted)" fontSize="11">{n.sub}</text></g>})}
        <rect x="190" y="301" width="410" height="38" rx="9" fill="var(--bg)" stroke="var(--line)"/>
        <text x="395" y="325" fill={accent} textAnchor="middle" fontSize="14" fontWeight="600">{stage.label}</text>
      </svg>
    </div>
    <div className="request-detail">
      <section className="request-stage" aria-live="polite"><span className="lab-label">{stage.short.toUpperCase()}</span><h2>{stage.name}</h2><p>{step===6&&scenario==='error'?'A database operation fails unexpectedly. The application maps the failure to a generic 500 response.':step===8&&scenario==='missing'?'The client receives a valid HTTP response, but the requested product was not found. The interface can display a not-found state.':stage.detail}</p></section>
      <section className={'request-message'+(step<4?' waiting':'')}><p className="eyebrow">REQUEST</p><pre>{step>=4?request:'Waiting to send…'}</pre></section>
      <section className={'request-message'+(step<7?' waiting':'')}><p className="eyebrow">RESPONSE</p><pre>{step>=7?response:'Waiting for response…'}</pre></section>
      <p className="request-note">Illustrative fresh HTTPS connection over TCP (HTTP/1.1). Connections may be reused; HTTP/3 uses QUIC. No real network requests are made.</p>
    </div>
    <nav className="request-timeline" aria-label="Request stages">{stages.map((s,i)=><button type="button" className="request-step" key={s.name} aria-current={step===i?'step':undefined} data-done={i<step} aria-label={s.name} onClick={()=>jump(i)}><span>{String(i+1).padStart(2,'0')}</span><strong>{s.short}</strong></button>)}</nav>
  </section>;
}
