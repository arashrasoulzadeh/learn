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
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[hydrated,setHydrated]=useState(false);
  const reduced=useReducedMotion(),last=step===steps.length-1;
  useEffect(()=>setHydrated(true),[]);
  useEffect(()=>{
    if(!playing)return;
    const id=window.setTimeout(()=>{if(last)setPlaying(false);else setStep(v=>v+1)},1800/speed);
    return()=>clearTimeout(id);
  },[playing,step,last,speed]);
  const jump=(n:number)=>{setPlaying(false);setStep(Math.max(0,Math.min(steps.length-1,n)))};
  return <section className="lab server-lab" aria-label={title} data-hydrated={hydrated?'true':'false'}>
    <div className="lab-head"><h3>{title}</h3><span className="lab-label">{label}</span></div>
    <div className="lab-controls">
      <label>سرعت<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
      <button className="primary" type="button" onClick={()=>{if(playing)setPlaying(false);else{if(last)setStep(0);setPlaying(true)}}}>{playing?'مکث':last?'پخش دوباره':'پخش'}</button>
      <button className="secondary" type="button" aria-label="مرحله قبل" onClick={()=>jump(step-1)} disabled={step===0}>←</button>
      <button className="secondary" type="button" aria-label="مرحله بعد" onClick={()=>jump(step+1)} disabled={last}>→</button>
      <button className="secondary" type="button" onClick={()=>jump(0)}>از ابتدا</button>
    </div>
    <svg className="lab-graph server-lab-graph" viewBox="0 0 760 390" role="img" direction="ltr" aria-label={alt}>
      <defs><marker id="server-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={C.accent}/></marker></defs>
      {renderScene(step,playing&&!reduced)}
    </svg>
    <div className="lab-steps" aria-label="انتخاب مرحله">{steps.map((s,i)=><button type="button" className="step-button" key={s.title} aria-current={step===i?'step':undefined} aria-label={s.title} title={s.title} onClick={()=>jump(i)}>{(i+1).toLocaleString('fa-IR')}</button>)}</div>
    <div className="lab-stage" aria-live="polite"><small>مرحله {(step+1).toLocaleString('fa-IR')} از {steps.length.toLocaleString('fa-IR')}</small><br/><strong>{steps[step].title}</strong><p>{steps[step].detail}</p></div>
    <p className="lab-caption">{reduced?'حرکت کاهش‌یافته فعال است؛ تغییر مرحله بدون حرکت بسته‌ها در دسترس است.':'اعداد یک مدل آموزشی‌اند. پیش از پخش کامل، وضعیت هر مرحله را با دکمه‌های قبل و بعد بررسی کنید.'}</p>
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
 {title:"ابتدا ظرفیت فیزیکی",detail:"دو سرور سالم هر کدام ۴ درخواست در ثانیه پردازش می‌کنند. ورودی ۱۰ است و ظرفیت ۸؛ دست‌کم ۲ درخواست در ثانیه باید منتظر بمانند یا رد شوند. الگوریتم مسیریابی ظرفیت نمی‌سازد."},
 {title:"گردش نوبتی بین مقصدها",detail:"Round Robin درخواست‌ها را نوبتی بین S1 و S2 توزیع می‌کند. در نرخ ۱۰ درخواست در ثانیه، هر سرور ۴ درخواست می‌پذیرد و مجموع ۲ درخواست باقی می‌ماند."},
 {title:"وزن نسبت انتخاب را عوض می‌کند",detail:"در مدل ساده بدون انتقال مجدد، وزن ۲ به ۱ حدود ۷ درخواست را به S1 و ۳ را به S2 می‌فرستد؛ S1 چهار و S2 سه درخواست می‌پذیرند. ظرفیت فیزیکی همچنان ۸ است، اما ۱ واحد از آن بلااستفاده می‌ماند."},
 {title:"انتخاب براساس کار فعال",detail:"این مرحله عکس لحظه‌ای هم‌زمانی است، نه نرخ. S1 سه درخواست فعال و S2 یک درخواست دارد؛ Least Connections مقصد S2 را انتخاب می‌کند. از تعداد درخواست فعال نمی‌توان نرخ پذیرش را محاسبه کرد."},
 {title:"Affinity سخت‌گیرانه و ظرفیت بلااستفاده",detail:"فرض کنید هر ۱۰ درخواست به S1 متصل‌اند. S1 چهار درخواست می‌پذیرد و شش درخواست منتظر می‌مانند یا رد می‌شوند؛ S2 ظرفیت آزاد دارد اما سیاست اجازه استفاده نمی‌دهد."},
 {title:"افزودن ظرفیت واقعی",detail:"با افزودن S3 با ظرفیت ۴ درخواست در ثانیه، ظرفیت کل از ۸ به ۱۲ می‌رسد و در این مدل هر ۱۰ درخواست قابل پذیرش‌اند."}
];
export function LoadBalancingLab(){
 return <LabFrame title="توزیع بار: مسیریابی در برابر ظرفیت" label="آزمایش سرور / 01" steps={lbSteps} alt="توزیع‌کننده بار، ده درخواست در ثانیه را میان سرورها توزیع می‌کند" renderScene={(s,m)=>{
   const count=s===5?3:2,cap=count*4,accepted=s===2?7:s===4?4:Math.min(10,cap),rejected=10-accepted;
   const strategy=['Capacity model','Round Robin','Weighted 2:1','Least Connections','IP Hash / strict affinity','Round Robin + S3'][s];
   const loads=s===0?[4,4,0]:s===1?[4,4,0]:s===2?[4,3,0]:s===3?[3,1,0]:s===4?[4,0,0]:[4,3,3];
   return <><Box x={25} y={110} w={120} h={120} title="Incoming" lines={['10 req/s',strategy]} active/><Box x={190} y={105} w={145} h={130} title="Load Balancer" lines={[strategy,s===4?'A → S1':'healthy targets'] } accent/>
    {[0,1,2].slice(0,count).map((i)=><g key={i}><Box x={410} y={35+i*105} w={140} h={80} title={'S'+(i+1)} lines={[s===3?'active '+loads[i]:s===4&&i===1?'load 0/4':'load '+loads[i]+'/4','capacity 4/s']} active={s===3?i===1:s===4?i===0:true} danger={s===4&&i===0}/>{s!==3&&<Bar x={430} y={91+i*105} w={100} value={loads[i]/4} label={(loads[i]/4*100).toFixed(0)+'%'} bad={loads[i]>=4}/>}</g>)}
    <Flow d="M145 170 L190 170" label="requests" x={167} y={158} active motion={m}/><Flow d="M335 155 L410 75" active={s!==3} motion={m}/><Flow d="M335 175 L410 180" active={s!==4} motion={m}/>{count===3&&<Flow d="M335 190 L410 285" active motion={m}/>}
    {s===4&&<Pill x={625} y={95} text="S1 FULL" bad/>}{s===4&&<Pill x={625} y={185} text="S2 has 4/s headroom"/>}
    <Metric x={625} y={255} label="PHYSICAL CAPACITY" value={cap+' req/s'}/><Metric x={625} y={310} label="ACCEPTED / REJECTED" value={s===3?'N/A':accepted+' / '+rejected} bad={s!==3&&rejected>0}/></>;
 }}/>;
}

const replSteps:Step[]=[
 {title:"شروع همگام",detail:"Primary و Replica هر دو نسخه ۴۲ را اعمال کرده‌اند. replication log خالی است و عقب‌ماندگی صفر است."},
 {title:"ثبت ابتدا در Primary",detail:"نوشتن نسخه ۴۳ روی Primary ثبت می‌شود. در مدل ناهمگام، ممکن است کلاینت پیش از اعمال آن روی Replica پاسخ موفق بگیرد."},
 {title:"خواندن کهنه از Replica",detail:"Primary نسخه ۴۳ و Replica نسخه ۴۲ دارد. خواندن از Replica هنوز تغییر تازه را نمی‌بیند."},
 {title:"اعمال تغییر و بستن فاصله",detail:"تغییر معلق روی Replica اعمال می‌شود. هر دو به نسخه ۴۳ می‌رسند و عقب‌ماندگی صفر می‌شود."},
 {title:"تأخیر با صف محدود",detail:"با ۶ نوشتن در ثانیه، ظرفیت اعمال ۸ و تأخیر ۲ ثانیه، حدود ۱۲ تغییر می‌تواند معلق بماند، حتی با ظرفیت اعمال کافی."},
 {title:"اشباع و رشد عقب‌ماندگی",detail:"وقتی نرخ نوشتن ۱۲ و ظرفیت اعمال ۸ تغییر در ثانیه است، پس از گرم‌شدن صف با نرخ تقریبی ۴ تغییر در ثانیه رشد می‌کند."},
 {title:"کاهش ترافیک و جبران عقب‌ماندگی",detail:"وقتی نوشتن به ۲ در ثانیه کاهش یابد، ظرفیت اضافی ۶ تغییر در ثانیه می‌تواند صف را تخلیه کند."}
];
export function ReplicationLab(){
 return <LabFrame title="همانندسازی: ثبت‌شده، معلق، اعمال‌شده" label="آزمایش سرور / 02" steps={replSteps} alt="نسخه‌های Primary، لاگ همانندسازی و Replica" renderScene={(s,m)=>{
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
 {title:"دریافت درخواست مشخص",detail:"کلاینت GET /api/orders را به endpoint عمومی HTTPS می‌فرستد. آدرس داخلی سرویس جزو قرارداد کلاینت نیست."},
 {title:"پایان TLS و بررسی metadata",detail:"پراکسی اتصال را در لبه رمزگشایی می‌کند و Host و Path لازم برای مسیریابی را می‌بیند. قوانین سفارش همچنان وظیفه سرویس است."},
 {title:"تطبیق قانون مسیر",detail:"جدول مسیر /api/* را با upstream API منطبق می‌کند؛ /app/* به Web می‌رود."},
 {title:"ارسال و بازگرداندن پاسخ",detail:"پراکسی همان درخواست را به API :8080 می‌فرستد. API پاسخ 200 OK می‌دهد و پراکسی آن را به کلاینت منتقل می‌کند."},
 {title:"شکست اتصال upstream",detail:"اگر مسیر صحیح باشد ولی اتصال API شکست بخورد، لبه می‌تواند 502 Bad Gateway بدهد. انتخاب مسیر و سلامت upstream جدا هستند."}
];
export function ReverseProxyLab(){
 return <LabFrame title="پراکسی معکوس: بررسی، تطبیق، ارسال" label="آزمایش سرور / 03" steps={proxySteps} alt="درخواست GET /api/orders از پراکسی معکوس عبور می‌کند" renderScene={(s,m)=><>
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
 {title:"اندازه‌گیری یک نمونه اشباع",detail:"ورودی ۱۲ درخواست در ثانیه و ظرفیت App 1 برابر ۴ است؛ ۸ درخواست در ثانیه از ظرفیت لایه برنامه بیشترند."},
 {title:"افزودن App 2",detail:"نمونه دوم ظرفیت لایه App را به ۸ در ثانیه می‌رساند. چهار درخواست هنوز از ظرفیت این لایه بیشترند."},
 {title:"توزیع میان دو نمونه",detail:"هر App حدود چهار درخواست در ثانیه می‌پذیرد. هر دو پر هستند و چهار درخواست دیگر در این لایه جای نمی‌گیرند."},
 {title:"افزودن App 3",detail:"سه نمونه ظرفیت App را به ۱۲ می‌رسانند؛ overflow لایه App صفر است، اما این به معنای تضمین throughput انتها به انتها نیست."},
 {title:"یافتن گلوگاه مشترک",detail:"با فرض یک پرس‌وجو برای هر درخواست، پایگاه داده مشترک با ظرفیت ۱۰ پرس‌وجو در ثانیه کل مسیر را به ۱۰ درخواست در ثانیه محدود می‌کند."}
];
export function HorizontalScalingLab(){
 return <LabFrame title="مقیاس‌پذیری افقی: افزودن نمونه و اندازه‌گیری" label="آزمایش سرور / 04" steps={hsSteps} alt="توزیع دوازده درخواست در ثانیه میان سه نمونه برنامه با ظرفیت چهار" renderScene={(s,m)=>{
   const apps=s===0?1:s<3?2:3;const appCap=apps*4;const appAccepted=Math.min(12,appCap);const endAccepted=Math.min(10,appAccepted);
   return <><Box x={25} y={125} w={125} h={100} title="Incoming" lines={['12 req/s']} active/><Box x={190} y={115} w={135} h={120} title="Load Balancer" lines={['healthy Apps',apps+' targets']} accent/>
    {[0,1,2].slice(0,apps).map(i=><Box key={i} x={385} y={35+i*105} w={145} h={78} title={'App '+(i+1)} lines={['capacity 4/s','load '+(s>=2||i===0?'4/4':i===1?'4/4':'0/4')]} active={s===1&&i===1||s===3&&i===2}/>)}
    <Box x={590} y={125} w={135} h={100} title="Shared DB" lines={['capacity 10 q/s',s===4?'10/10':'load '+Math.min(appAccepted,10)+'/10']} active={s===4} danger={s===4}/>
    <Flow d="M150 175 L190 175" active motion={m}/>{[0,1,2].slice(0,apps).map(i=><Flow key={i} d={'M325 175 L385 '+(74+i*105)} active={s>=2||i===0} motion={m}/>)}
    {s===4&&[0,1,2].map(i=><Flow key={'d'+i} d={'M530 '+(74+i*105)+' L590 175'} active motion={m}/>)}
    <Metric x={225} y={300} label="APP CAPACITY" value={appCap+' req/s'}/><Metric x={390} y={300} label="APP OVERFLOW" value={Math.max(0,12-appCap)+' req/s'} bad={12>appCap}/><Metric x={610} y={300} label="END-TO-END ACCEPTED" value={endAccepted+' req/s'} bad={endAccepted<appAccepted}/></>;
 }}/>;
}

const vsSteps:Step[]=[
 {title:"اندازه‌گیری میزبان کوچک",detail:"بار ۸ درخواست در ثانیه روی ۲ CPU و ۸ GB اجرا می‌شود. CPU برابر ۹۶٪ و ظرفیت مدل ۴ درخواست در ثانیه است؛ نصف بار بیش از ظرفیت است."},
 {title:"تغییر اندازه همان ماشین",detail:"Scale-up منابع همان میزبان را به ۸ CPU و ۳۲ GB می‌رساند. نمونه یا دامنه خرابی جدیدی ساخته نمی‌شود."},
 {title:"اندازه‌گیری تغییر عملکرد",detail:"ظرفیت مدل ۱۲ درخواست در ثانیه است. بار ۸ در ثانیه قابل پذیرش می‌شود؛ P99 در مدل از ۲۴۰ به ۷۰ میلی‌ثانیه می‌رسد، نه در یک benchmark واقعی."},
 {title:"شمارش دوباره دامنه خرابی",detail:"هنوز یک میزبان و یک volume محلی وجود دارد. منابع آزاد بیشتر افزونگی ایجاد نکرده‌اند."},
 {title:"خرابی میزبان",detail:"اگر تنها میزبان از دست برود، ظرفیت قابل استفاده App صفر است. Scale-up ظرفیت را بهتر کرده بود، نه دسترس‌پذیری مستقل."}
];
export function VerticalScalingLab(){
 return <LabFrame title="مقیاس‌پذیری عمودی: میزبان بزرگ‌تر، همان دامنه خرابی" label="آزمایش سرور / 05" steps={vsSteps} alt="تغییر منابع میزبان از دو CPU به هشت با بار ثابت" renderScene={(s,m)=>{
   const upgraded=s>=1,down=s===4;
   return <><Box x={30} y={130} w={130} h={95} title="Workload" lines={['8 req/s','constant']} active/><Box x={240} y={65} w={250} h={190} title={down?'App Host · DOWN':'App Host'} lines={upgraded?['8 CPU · 32 GB',down?'capacity 0 req/s':'capacity 12 req/s',down?'P99 N/A':s>=2?'P99 70 ms':'same Host ID']:['2 CPU · 8 GB','CPU 96%','capacity 4 req/s']} active={s===1||s===2} danger={down} accent/><Box x={570} y={120} w={145} h={105} title="Local State" lines={['volume A','same host']} active={s===3||s===4} danger={down}/>
    <Flow d="M160 177 L240 177" label="8/s" x={200} y={163} active={!down} motion={m}/><Flow d="M490 177 L570 177" active={!down&&s>=3} motion={m}/>
    <Metric x={300} y={315} label="SERVED / OVERFLOW" value={down?'0 / 8':upgraded?'8 / 0':'4 / 4'} bad={down||!upgraded}/><Metric x={520} y={315} label="FAILURE DOMAINS" value="1" bad={s>=3}/></>;
 }}/>;
}

const healthSteps:Step[]=[
 {title:"App 2 آماده است",detail:"در مدل، بررسی GET /ready پاسخ 200 می‌دهد چون App 2 به پایگاه داده ضروری دسترسی دارد؛ پس در مجموعه مقصدها باقی می‌ماند."},
 {title:"خرابی DB با فرایند زنده",detail:"Critical DB از دسترس خارج می‌شود ولی App 2 هنوز اجرا می‌شود. زنده بودن فرایند و توان پاسخ به کاربر از هم جدا می‌شوند."},
 {title:"جداسازی /live و /ready",detail:"App 2 می‌تواند /live 200 و /ready 503 برگرداند، چون وابستگی لازم برای سرویس‌دهی در دسترس نیست."},
 {title:"حذف مقصد ناآماده",detail:"مجموعه مقصد آماده از App1 و App2 به App1 تغییر می‌کند. برای این تصمیم مسیریابی restart لازم نیست."},
 {title:"هدایت کاربر به مقصد آماده",detail:"درخواست بعدی به App 1 می‌رود و موفق می‌شود. Readiness ترافیک را از فرایند زنده اما ناتوان در سرویس‌دهی دور کرده است."}
];
export function HealthChecksLab(){
 return <LabFrame title="بررسی سلامت: زنده بودن یعنی آماده بودن نیست" label="آزمایش سرور / 06" steps={healthSteps} alt="حذف نمونه برنامه با وابستگی پایگاه داده خراب از مجموعه آماده" renderScene={(s,m)=>{
   const dbDown=s>=1,app2Ready=s<2,removed=s>=3;
   return <><Box x={25} y={120} w={155} h={120} title="Load Balancer" lines={['ready set',removed?'[App1]':'[App1, App2]']} active={s===3}/><Box x={280} y={55} w={165} h={90} title="App 1" lines={['/live 200','/ready 200']} active={s===4}/><Box x={280} y={205} w={165} h={105} title="App 2" lines={['/live 200','/ready '+(app2Ready?'200':'503')]} active={s===0||s===2} danger={!app2Ready}/><Box x={560} y={205} w={150} h={100} title="Critical DB" lines={[dbDown?'DOWN':'SELECT 1 OK']} danger={dbDown} active={s===1}/>
    <Flow d="M180 190 L280 257" label="GET /ready" x={230} y={238} active={s===0} motion={m}/><Flow d="M445 257 L560 257" label="SELECT 1" x={502} y={242} active={s===0||s===1} bad={dbDown} motion={m}/>{s===4&&<Flow d="M180 165 L280 100" label="user request" x={230} y={120} active motion={m}/>}
    {s===0&&<Pill x={365} y={345} text="200 READY"/>}{s===2&&<><Pill x={335} y={345} text="/live 200"/><Pill x={500} y={345} text="/ready 503" bad/></>}{s===4&&<Pill x={365} y={345} text="200 OK"/>}</>;
 }}/>;
}

const discoverySteps:Step[]=[
 {title:"حل نام پایدار سرویس",detail:"Checkout به orders.service وابسته است، نه یک IP ماشین. از registry یا سازوکار شبیه DNS مقصدهای جاری را می‌خواهد."},
 {title:"دریافت مقصدها با TTL",detail:"پاسخ شامل 10.0.0.12:443 و 10.0.0.19:443 با TTL سی ثانیه است. آدرس‌ها داده زمان اجرا هستند، نه هویت سرویس."},
 {title:"اتصال به یک مقصد مشخص",detail:"Checkout به 10.0.0.12:443 متصل می‌شود. نام منطقی به اتصال شبکه به یک نمونه تبدیل شده است."},
 {title:"شکست اتصال به مقصد کش‌شده",detail:"10.0.0.12 پیش از refresh حذف می‌شود. در این مثال اتصال قدیمی ECONNREFUSED می‌دهد، هرچند orders.service همچنان وجود دارد."},
 {title:"تازه‌سازی و اتصال جایگزین",detail:"پاسخ تازه 10.0.0.19:443 و 10.0.0.27:443 را شامل می‌شود و IP حذف‌شده دیگر در مجموعه جاری نیست. Checkout بدون تغییر نام وابستگی به نمونه جایگزین متصل می‌شود."}
];
export function ServiceDiscoveryLab(){
 return <LabFrame title="کشف سرویس: نام پایدار، مقصدهای متغیر" label="آزمایش سرور / 07" steps={discoverySteps} alt="حل نام orders.service به مقصدهای IP متغیر" renderScene={(s,m)=><>
   <Box x={25} y={120} w={160} h={120} title="Checkout" lines={['needs Orders','orders.service:443']} active={s===0}/><Box x={270} y={70} w={210} h={205} title="Service Registry" lines={['orders.service',s===0?'resolving…':s>=4?'10.0.0.19:443':'10.0.0.12:443',s===0?'':s>=4?'10.0.0.27:443':'10.0.0.19:443','TTL 30s']} active={s===1||s===4}/><Box x={565} y={65} w={160} h={85} title="Orders A" lines={['10.0.0.12:443',s>=3?'REMOVED':'healthy']} danger={s>=3} active={s===2}/><Box x={565} y={225} w={160} h={85} title="Orders C" lines={['10.0.0.27:443',s>=4?'healthy':'not registered']} active={s===4}/>
   <Flow d="M185 180 L270 180" label="resolve" x={227} y={165} active={s===0||s===4} motion={m}/><Flow d="M480 145 L565 108" label="dial .12" x={523} y={112} active={s===2||s===3} bad={s===3} motion={m}/>{s===4&&<Flow d="M480 210 L565 267" label="dial .27" x={523} y={253} active motion={m}/>}
   {s===1&&<Pill x={375} y={325} text="2 endpoints · TTL 30s"/>}{s===2&&<Pill x={645} y={175} text="CONNECTED"/>}{s===3&&<Pill x={645} y={175} text="ECONNREFUSED" bad/>}{s===4&&<Pill x={645} y={345} text="CONNECTED"/>}</>}/>;
}

const poolSteps:Step[]=[
 {title:"هزینه بدون استخر",detail:"در مدل، هر درخواست TCP، TLS، احراز هویت و ساخت نشست پایگاه داده را تکرار می‌کند. setup بخشی از تأخیر درخواست می‌شود."},
 {title:"ساخت چهار اتصال آماده",detail:"استخر چهار اتصال محدود می‌سازد. پایگاه داده چهار نشست می‌بیند، نه یک نشست جدید برای هر HTTP request."},
 {title:"قرض گرفتن و بازگرداندن اتصال ۱",detail:"A اتصال ۱ را می‌گیرد، SELECT را اجرا می‌کند و همان اتصال را بازمی‌گرداند. اتصال باز و قابل استفاده مجدد است."},
 {title:"استفاده دوباره B از اتصال ۱",detail:"B اتصال آماده را می‌گیرد و handshake تازه لازم ندارد. هزینه setup کم می‌شود و تعداد اتصال محدود می‌ماند."},
 {title:"انتظار E در استخر پر",detail:"هر چهار جایگاه مشغول است. E طبق سیاست منتظر می‌ماند یا timeout می‌شود؛ اتصال پنجم بی‌صدا باز نمی‌شود."}
];
export function ConnectionPoolingLab(){
 return <LabFrame title="استخر اتصال: دریافت، query، بازگشت، استفاده مجدد" label="آزمایش سرور / 08" steps={poolSteps} alt="پنج درخواست با چهار اتصال شماره‌دار پایگاه داده" renderScene={(s,m)=><>
   <Box x={20} y={105} w={150} h={135} title="HTTP Requests" lines={['A  B  C  D  E',s===4?'E waiting':'arriving'] } active={s===0||s===4}/>
   {s===0
    ? <Box x={240} y={80} w={260} h={175} title="Per-request setup" lines={['TCP connect','TLS + authentication','new DB session']} active danger/>
    : <Box x={240} y={65} w={260} h={210} title="Connection Pool" lines={['4 warm DB connections','[#1] [#2] [#3] [#4]',s===2?'A → #1 → return':s===3?'B → reuse #1':s===4?'all 4 busy':'bounded slots']} active accent/>}
   <Box x={585} y={105} w={145} h={135} title="Database" lines={['max 100',s===0?'new session / request':'active: 4']} active={s===0||s===1}/>
   {s===0
    ? <><Flow d="M170 170 L240 170" label="A" x={205} y={155} active motion={m}/><Flow d="M500 170 L585 170" label="new session" x={542} y={155} active bad motion={m}/><Pill x={370} y={315} text="setup paid on every request" bad/></>
    : <><Flow d="M170 170 L240 170" label={s===4?'E waits':'borrow'} x={205} y={155} active={s>=2} motion={m}/><Flow d="M500 170 L585 170" label={s===4?'4 open':'query'} x={542} y={155} active={s>=1} motion={m}/></>}
   {s===2&&<Pill x={370} y={315} text="A returns #1"/>}{s===3&&<Pill x={370} y={315} text="B reuses #1"/>}{s===4&&<Pill x={370} y={315} text="POOL FULL · E waits" bad/>}</>}/>;
}

const failoverSteps:Step[]=[
 {title:"ثبت از طریق مقصد پایدار",detail:"کلاینت INSERT را به db.internal می‌فرستد. پس از ثبت موفق هر دو گره در موقعیت LSN 120 مدل‌اند و فقط Primary فعلی مجاز به نوشتن است."},
 {title:"تشخیص عدم پاسخ نویسنده",detail:"نوشتن بعدی timeout می‌شود. نتیجه آن از دید کلاینت نامعلوم است؛ تشخیص به تنهایی نویسنده جدید امن ایجاد نمی‌کند."},
 {title:"مهار نویسنده قدیمی",detail:"Fencing مانع پذیرش نوشتن توسط Primary قدیمی در صورت بازگشت می‌شود؛ دو نویسنده متعارض نباید وجود داشته باشند."},
 {title:"ارتقای نامزد با تازگی کافی",detail:"Replica در LSN 120 است که با آخرین موقعیت ثبت‌شده معلوم در این سناریو تطبیق دارد. سیاست بازیابی این موقعیت را می‌پذیرد و گره به نویسنده یکتا تبدیل می‌شود."},
 {title:"تغییر endpoint و تلاش امن مجدد",detail:"db.internal به گره ارتقایافته اشاره می‌کند. پس از بررسی نتیجه نامعلوم، یا با کلید idempotency که همراه اثر عملیات به‌طور اتمیک ثبت می‌شود، کلاینت تلاش مجدد امن انجام می‌دهد. COMMIT OK در این مدل نتیجه همین تلاش کنترل‌شده است."}
];
export function FailoverLab(){
 return <LabFrame title="جابه‌جایی پس از خرابی: تشخیص، مهار، ارتقا، مسیریابی" label="آزمایش سرور / 09" steps={failoverSteps} alt="جابه‌جایی پایگاه داده با مقصد ثابت، fencing و بررسی LSN" renderScene={(s,m)=><>
   <Box x={25} y={125} w={130} h={105} title="Client" lines={['INSERT','db.internal']} active={s===0||s===4}/><Box x={210} y={125} w={150} h={105} title="db.internal" lines={[s===4?'→ New Primary':'→ Primary']} active={s===4} accent/><Box x={450} y={45} w={220} h={105} title={s>=2?'Old Primary':'Primary'} lines={['LSN 120',s>=2?'FENCED':s===1?'NO RESPONSE':'WRITABLE']} danger={s===1||s>=2} active={s===1||s===2}/><Box x={450} y={230} w={220} h={105} title={s>=3?'New Primary':'Replica'} lines={['LSN 120',s>=3?'WRITABLE':'READ ONLY']} active={s===3||s===4} accent={s>=3}/>
   <Flow d="M155 177 L210 177 L450 97" label="INSERT" x={330} y={115} active={s===0||s===1} bad={s===1} motion={m}/>{s===4&&<Flow d="M155 195 L210 195 L450 282" label="safe retry INSERT" x={330} y={250} active motion={m}/>}
   {s===0&&<Pill x={560} y={185} text="COMMIT OK"/>}{s===1&&<Pill x={285} y={270} text="write timeout" bad/>}{s===2&&<Pill x={560} y={185} text="OLD WRITER FENCED" bad/>}{s===3&&<Pill x={560} y={370} text="PROMOTED"/>}{s===4&&<Pill x={285} y={270} text="COMMIT OK"/>}</>}/>;
}

const affinitySteps:Step[]=[
 {title:"تعیین کوکی در درخواست نخست",detail:"کاربر A بدون کوکی affinity می‌آید. load balancer نمونه App 1 را انتخاب می‌کند و Set-Cookie: route=app1 می‌دهد."},
 {title:"بازگشت به App 1",detail:"مرورگر route=app1 می‌فرستد. توزیع‌کننده App 1 را انتخاب می‌کند و نشست محلی A با cart=3 پیدا می‌شود."},
 {title:"اندازه‌گیری توزیع نامتوازن",detail:"کاربران چسبنده نامتوازن جمع می‌شوند. App 1 به ۹۰٪ و App 2 به ۳۰٪ می‌رسد، هرچند میانگین مجموعه خوب به نظر می‌رسد."},
 {title:"خرابی مقصد چسبنده",detail:"App 1 از دست می‌رود. کوکی هنوز app1 را نشان می‌دهد اما نشست محلی A از دست رفته است. Affinity داده را پایدار نکرده بود."},
 {title:"مقایسه با طراحی ذخیره مشترک",detail:"این مرحله یک طراحی جایگزین است: اگر پیش از خرابی، نشست A در ذخیره مشترک پایدار نوشته شده باشد، App 2 می‌تواند cart=3 را بخواند. داده ازدست‌رفته مرحله قبل خودبه‌خود بازیابی نمی‌شود."}
];
export function SessionAffinityLab(){
 return <LabFrame title="چسبندگی نشست: مسیریابی در برابر دوام وضعیت" label="آزمایش سرور / 10" steps={affinitySteps} alt="کوکی کاربر و مقایسه نشست محلی با ذخیره مشترک" renderScene={(s,m)=><>
   <Box x={20} y={115} w={150} h={125} title="User A" lines={['GET /cart',s>=1?'cookie: route=app1':'cookie: —']} active={s===0||s===1}/><Box x={225} y={105} w={165} h={145} title="Load Balancer" lines={['affinity cookie',s===4?'fallback → App2':'route=app1']} active={s===0||s===4} accent/><Box x={475} y={40} w={210} h={105} title="App 1" lines={[s>=3?'DOWN':'session A: cart=3',s===2?'load 90%':'local state']} danger={s>=3} active={s===1||s===2}/><Box x={475} y={215} w={210} h={105} title="App 2" lines={[s===4?'cart=3 via prior shared state':'no local session A',s===2?'load 30%':'healthy']} active={s===4}/>{s===4&&<Box x={225} y={285} w={165} h={70} title="Shared Session Store" lines={['pre-existing A → cart=3']} active/>}
   {(s===0||s===1||s===3)&&<Flow d="M170 177 L225 177 L390 177 L475 92" label={s===1?'route=app1':s===3?'dead target':undefined} x={425} y={150} active bad={s===3} motion={m}/>}
   {s===4&&<><Flow d="M170 195 L225 195 L475 267" label="route App2" x={335} y={260} active motion={m}/><Flow d="M475 290 L390 320" label="read A" x={430} y={330} active motion={m}/></>}
   {s===0&&<Pill x={307} y={290} text="Set-Cookie: route=app1"/>}{s===1&&<Pill x={580} y={180} text="cart=3 found"/>}{s===2&&<Pill x={580} y={180} text="App1 90% · App2 30%" bad/>}{s===3&&<Pill x={307} y={290} text="session unavailable" bad/>}</>}/>;
}
