import { useState, useEffect } from 'react';

const stages = [
  {name:'آماده‌سازی درخواست',short:'مرورگر',from:0,to:0,label:'تجزیهٔ آدرس و تعیین نوع درخواست',detail:'مرورگر آدرس را تجزیه می‌کند، متد درخواست را انتخاب می‌کند و حافظهٔ نهان خود را بررسی می‌کند. در این شبیه‌سازی فرض می‌کنیم داده در حافظهٔ نهان نیست و اتصال جدیدی لازم است.'},
  {name:'یافتن نشانی IP دامنه',short:'DNS',from:0,to:1,label:'یافتن نشانی IP با DNS',detail:'حل‌کنندهٔ DNS نشانی IP نام میزبان را پیدا می‌کند و برمی‌گرداند. مسیر URL بخشی از DNS نیست. اگر پاسخ قبلاً ذخیره شده باشد، ممکن است نیازی به جست‌وجوی مجدد نباشد.'},
  {name:'برقراری اتصال TCP',short:'TCP',from:0,to:2,label:'SYN → SYN-ACK → ACK',detail:'کلاینت و سرور با دست‌دهی سه‌مرحله‌ای، یک جریان بایت قابل‌اعتماد برقرار می‌کنند.'},
  {name:'امن‌سازی اتصال',short:'TLS',from:0,to:2,label:'دست‌دهی TLS',detail:'کلاینت گواهی سرور را اعتبارسنجی می‌کند و کلیدهای رمزنگاری را با سرور توافق می‌کند. HTTPS از پیام‌های HTTP هنگام انتقال محافظت می‌کند.'},
  {name:'ارسال درخواست HTTP',short:'درخواست',from:0,to:2,label:'درخواست رمزنگاری‌شدهٔ HTTP',detail:'درخواست شامل متد، مسیر، سرآیندها و گاهی بدنه است. پراکسی مرزی درخواست را دریافت می‌کند.'},
  {name:'اجرای منطق برنامه',short:'برنامه',from:2,to:3,label:'پراکسی، مسیریابی و پردازش',detail:'پراکسی درخواست را به برنامه می‌فرستد. برنامه مسیر مناسب را پیدا می‌کند، دسترسی و ورودی را اعتبارسنجی می‌کند و منطق کسب‌وکار را اجرا می‌کند.'},
  {name:'دسترسی به داده‌ها',short:'پایگاه داده',from:3,to:4,label:'خواندن یا نوشتن داده و دریافت نتیجه',detail:'برنامه در صورت نیاز از پایگاه داده یا حافظهٔ نهان داده می‌گیرد. بعضی درخواست‌ها اصلاً به دسترسی به داده نیاز ندارند.'},
  {name:'بازگرداندن پاسخ HTTP',short:'پاسخ',from:3,to:0,label:'کد وضعیت، سرآیندها و بدنه',detail:'برنامه نتیجه را از طریق پراکسی به مرورگر برمی‌گرداند. کد وضعیت نشان می‌دهد درخواست چه نتیجه‌ای داشته است.'},
  {name:'به‌روزرسانی مرورگر',short:'نمایش',from:0,to:0,label:'تجزیهٔ پاسخ و به‌روزرسانی رابط',detail:'مرورگر یا کلاینت جاوااسکریپت پاسخ را تجزیه می‌کند، رابط کاربری را به‌روز می‌کند و در صورت مجاز بودن، پاسخ را در حافظهٔ نهان ذخیره می‌کند.'}
];
const nodes = [
  {x:90,y:220,label:'مرورگر',sub:'کلاینت',icon:'browser'},
  {x:290,y:78,label:'حل‌کنندهٔ DNS',sub:'تبدیل نام به IP',icon:'dns'},
  {x:290,y:220,label:'پراکسی مرزی',sub:'اتصال',icon:'proxy'},
  {x:495,y:220,label:'سرور برنامه',sub:'منطق کسب‌وکار',icon:'app'},
  {x:700,y:220,label:'پایگاه داده',sub:'ذخیره‌سازی',icon:'db'}
];
const scenarios = {
  get:{method:'GET',path:'/api/products/42',status:'200 OK',body:'{"id":42,"name":"Keyboard"}'},
  post:{method:'POST',path:'/api/products',status:'201 Created',body:'{"id":43,"name":"Mouse"}'},
  missing:{method:'GET',path:'/api/products/999',status:'404 Not Found',body:'{"error":"Product not found"}'},
  error:{method:'GET',path:'/api/products/42',status:'500 Internal Server Error',body:'{"error":"Unexpected server error"}'}
};
type Scenario = keyof typeof scenarios;
const faNumber=(n:number)=>new Intl.NumberFormat('fa-IR',{useGrouping:false}).format(n);
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
  return <section className="request-experience" aria-label="آموزش تعاملی درخواست HTTP">
    <div className="request-toolbar">
      <div className="lab-controls">
        <label>سناریو<select value={scenario} onChange={e=>{setScenario(e.target.value as Scenario);jump(0);}}><option value="get">دریافت موفق · GET ۲۰۰</option><option value="post">ایجاد موفق · POST ۲۰۱</option><option value="missing">یافت نشد · GET ۴۰۴</option><option value="error">خطای سرور · GET ۵۰۰</option></select></label>
        <label>سرعت<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={0.5}>۰٫۵ برابر</option><option value={1}>۱ برابر</option><option value={2}>۲ برابر</option></select></label>
        <button className="primary" type="button" onClick={()=>{if(playing)setPlaying(false);else{if(last)setStep(0);setPlaying(true);}}}>{playing?'❚❚ توقف':last?'↻ پخش مجدد':'▶ پخش'}</button>
        <button className="secondary" type="button" aria-label="مرحلهٔ قبل" onClick={()=>jump(step-1)} disabled={step===0}>→</button>
        <button className="secondary" type="button" aria-label="مرحلهٔ بعد" onClick={()=>jump(step+1)} disabled={last}>←</button>
        <button className="secondary" type="button" onClick={()=>jump(0)}>از ابتدا</button>
      </div>
      <span className="request-counter">مرحلهٔ {faNumber(step+1)} از {faNumber(stages.length)}</span>
    </div>
    <div className="request-canvas">
      <svg viewBox="0 0 790 355" direction="ltr" role="img" aria-label={stage.name}>
        <defs><pattern id="request-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="var(--line)"/></pattern><marker id="request-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6Z" fill={accent}/></marker></defs>
        <rect width="790" height="355" fill="url(#request-grid)" opacity=".8"/>
        {[[0,1],[0,2],[2,3],[3,4]].map(([a,b])=><line key={a+'-'+b} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--line)" strokeWidth="2" strokeDasharray="5 6"/>)}
        {stage.from!==stage.to&&<g><path d={track} fill="none" stroke={accent} strokeWidth="3" opacity=".8"/>{playing&&<circle className="request-packet-motion" r="6" fill={accent}><animateMotion key={step+'-'+scenario+'-'+speed} dur={(1.8/speed)+'s'} path={track} repeatCount="indefinite"/></circle>}<circle className={playing?'request-packet-static':undefined} cx={(from.x+to.x)/2} cy={(from.y+to.y)/2} r="5" fill={accent}/></g>}
        {nodes.map((n,i)=>{const active=activeNodes.includes(i);return <g key={n.label} transform={'translate('+n.x+' '+n.y+')'} style={{color:active?accent:'var(--muted)'}}><rect x="-59" y="-42" width="118" height="84" rx="13" fill="var(--bg)" stroke={active?accent:'var(--line)'} strokeWidth={active?2:1.2}/><g transform="translate(0 -10)"><NodeIcon icon={n.icon}/></g><text y="23" textAnchor="middle" fill={active?accent:'var(--ink)'} fontSize="12" direction="rtl" fontWeight="600">{n.label}</text><text y="62" textAnchor="middle" fill="var(--muted)" fontSize="11" direction="rtl">{n.sub}</text></g>})}
        <rect x="190" y="301" width="410" height="38" rx="9" fill="var(--bg)" stroke="var(--line)"/>
        <text x="395" y="325" fill={accent} textAnchor="middle" fontSize="14" direction={step===2?'ltr':'rtl'} fontWeight="600">{stage.label}</text>
      </svg>
    </div>
    <div className="request-detail">
      <section className="request-stage" aria-live="polite"><span className="lab-label">{stage.short.toUpperCase()}</span><h2>{stage.name}</h2><p>{step===6&&scenario==='error'?'عملیات پایگاه داده به‌طور غیرمنتظره شکست می‌خورد. برنامه خطا را به پاسخ عمومی ۵۰۰ تبدیل می‌کند.':step===8&&scenario==='missing'?'کلاینت یک پاسخ معتبر HTTP دریافت می‌کند، اما محصول موردنظر پیدا نشده است. رابط کاربری می‌تواند پیام «یافت نشد» را نمایش دهد.':stage.detail}</p></section>
      <section className={'request-message'+(step<4?' waiting':'')}><p className="eyebrow">درخواست</p><pre dir={step>=4?'ltr':'rtl'}>{step>=4?request:'در انتظار ارسال…'}</pre></section>
      <section className={'request-message'+(step<7?' waiting':'')}><p className="eyebrow">پاسخ</p><pre dir={step>=7?'ltr':'rtl'}>{step>=7?response:'در انتظار پاسخ…'}</pre></section>
      <p className="request-note">این شبیه‌سازی یک اتصال جدید HTTPS بر بستر TCP را با HTTP/1.1 نشان می‌دهد. اتصال‌ها می‌توانند دوباره استفاده شوند و HTTP/3 از QUIC استفاده می‌کند. هیچ درخواست واقعی به شبکه ارسال نمی‌شود.</p>
    </div>
    <nav className="request-timeline" aria-label="مراحل درخواست">{stages.map((s,i)=><button type="button" className="request-step" key={s.name} aria-current={step===i?'step':undefined} data-done={i<step} aria-label={s.name} onClick={()=>jump(i)}><span>{faNumber(i+1)}</span><strong>{s.short}</strong></button>)}</nav>
  </section>;
}
