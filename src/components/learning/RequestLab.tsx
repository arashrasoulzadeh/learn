import {useState,useEffect} from 'react';
const stages=[
  {name:'Browser prepares request',from:0,to:0,label:'URL → request intent',detail:'The browser parses the URL, chooses a method and checks its cache. This demo assumes a cache miss and a new connection.'},
  {name:'Resolve DNS',from:0,to:1,label:'DNS lookup',detail:'A resolver finds an IP address for the hostname. DNS caches can avoid this exchange.'},
  {name:'Establish TCP',from:0,to:2,label:'SYN → SYN-ACK → ACK',detail:'TCP establishes a reliable connection. The three-way handshake synchronizes both endpoints.'},
  {name:'Negotiate TLS',from:0,to:2,label:'TLS handshake',detail:'The client verifies the server certificate and negotiates encryption keys. HTTPS protects HTTP messages in transit.'},
  {name:'Send HTTP request',from:0,to:2,label:'HTTP request',detail:'The encrypted connection carries the HTTP method, target, headers and optional body. A reverse proxy may forward it to the application.'},
  {name:'Application processes request',from:2,to:3,label:'Route → handler',detail:'The application matches a route, checks authentication and validates input. Business logic decides what to do next.'},
  {name:'Access data',from:3,to:4,label:'Read / write',detail:'The application may use a database or cache. Some requests do not need data access.'},
  {name:'Return HTTP response',from:3,to:0,label:'Status + headers + body',detail:'The application returns a response through the proxy over the existing connection. Status codes describe the result.'},
  {name:'Browser handles response',from:0,to:0,label:'Parse → render',detail:'The browser or JavaScript client parses the response, updates UI state and may cache eligible responses.'}
];
const nodes=[{x:60,y:76,label:'Browser',icon:'▣'},{x:190,y:32,label:'DNS',icon:'◎'},{x:190,y:132,label:'Edge / proxy',icon:'⬡'},{x:340,y:132,label:'Application',icon:'▧'},{x:490,y:132,label:'Database',icon:'▤'}];
const scenarios={
  get:{method:'GET',path:'/api/products/42',status:'200 OK',body:'{"id":42,"name":"Keyboard"}'},
  post:{method:'POST',path:'/api/products',status:'201 Created',body:'{"id":43,"name":"Mouse"}'},
  missing:{method:'GET',path:'/api/products/999',status:'404 Not Found',body:'{"error":"Product not found"}'},
  error:{method:'GET',path:'/api/products/42',status:'500 Internal Server Error',body:'{"error":"Unexpected server error"}'}
};
type Scenario=keyof typeof scenarios;
export default function RequestLab(){
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[scenario,setScenario]=useState<Scenario>('get');
  const s=scenarios[scenario],stage=stages[step],last=step===stages.length-1;
  useEffect(()=>{
    if(!playing)return;
    const id=window.setTimeout(()=>{if(last)setPlaying(false);else setStep(v=>v+1);},1800/speed);
    return()=>window.clearTimeout(id);
  },[playing,step,speed,last]);
  const jump=(n:number)=>{setPlaying(false);setStep(Math.max(0,Math.min(stages.length-1,n)));};
  const from=nodes[stage.from],to=nodes[stage.to];
  const request=s.method+' '+s.path+' HTTP/1.1\nHost: shop.example\nAccept: application/json'+(s.method==='POST'?'\nContent-Type: application/json\nContent-Length: 16\n\n{"name":"Mouse"}':'');
  const response='HTTP/1.1 '+s.status+'\nContent-Type: application/json\nCache-Control: no-store\n\n'+s.body;
  return <section className="lab" aria-label="HTTP request simulator">
    <div className="lab-head"><h3>Follow the request</h3><span className="lab-label">LIVE SIMULATION / 01</span></div>
    <div className="lab-controls">
      <label>Scenario<select value={scenario} onChange={e=>{setScenario(e.target.value as Scenario);jump(0);}}><option value="get">GET · 200 OK</option><option value="post">POST · 201 Created</option><option value="missing">GET · 404 Not Found</option><option value="error">GET · 500 Server Error</option></select></label>
      <label>Speed<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
      <button className="primary" type="button" onClick={()=>{if(playing)setPlaying(false);else{if(last)setStep(0);setPlaying(true);}}}>{playing?'Pause':last?'Replay':'Play'}</button>
      <button className="secondary" type="button" onClick={()=>jump(step-1)} disabled={step===0}>←</button><button className="secondary" type="button" onClick={()=>jump(step+1)} disabled={last}>→</button><button className="secondary" type="button" onClick={()=>jump(0)}>Reset</button>
    </div>
    <svg className="lab-graph" viewBox="0 0 560 220" role="img" aria-label={stage.name}>
      {[[0,1],[0,2],[2,3],[3,4]].map(([a,b])=><line key={a+'-'+b} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--line)" strokeWidth="2" strokeDasharray="5 5"/>)}
      {stage.from!==stage.to&&<g><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--accent)" strokeWidth="2.5"/><circle r="5" fill="var(--accent)"><animateMotion key={step+'-'+scenario+'-'+speed} dur={(1.1/speed)+'s'} path={'M '+from.x+' '+from.y+' L '+to.x+' '+to.y} repeatCount={playing?'indefinite':'1'} fill="freeze"/></circle></g>}
      {nodes.map((n,i)=>{const active=i===stage.from||i===stage.to;return <g key={n.label}><rect x={n.x-42} y={n.y-21} width="84" height="42" rx="8" fill="var(--panel2)" stroke={active?'var(--accent)':'var(--line)'}/><text x={n.x} y={n.y+5} fill={active?'var(--accent)':'var(--muted)'} textAnchor="middle" fontSize="18">{n.icon}</text><text x={n.x} y={n.y+36} fill="var(--ink)" textAnchor="middle" fontSize="10">{n.label}</text></g>})}
      <text x="280" y="200" fill="var(--accent)" textAnchor="middle" fontSize="12">{stage.label}</text>
    </svg>
    <div className="lab-steps" aria-label="Jump to stage">{stages.map((s,i)=><button type="button" className="step-button" key={s.name} aria-current={step===i?'step':undefined} aria-label={s.name} title={s.name} onClick={()=>jump(i)}>{i+1}</button>)}</div>
    <div className="lab-stage" aria-live="polite"><small>STEP {step+1} OF {stages.length}</small><br/><strong>{stage.name}</strong><p>{step===6&&scenario==='error'?'In this example, a database operation fails unexpectedly. The application maps the failure to a generic 500 response.':stage.detail}</p></div>
    <div className="lab-code"><div><p className="eyebrow">REQUEST</p><pre>{step>=4?request:'Waiting to send…'}</pre></div><div><p className="eyebrow">RESPONSE</p><pre>{step>=7?response:'Waiting for response…'}</pre></div></div>
    <p className="lab-caption">Conceptual simulation of a fresh HTTP/1.1 HTTPS connection over TCP. Timing is illustrative; no real network requests are made. HTTP/3 uses QUIC instead of TCP.</p>
  </section>;
}
