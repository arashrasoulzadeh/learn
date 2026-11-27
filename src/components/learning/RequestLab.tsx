import {useState} from 'react';
import {usePlayback,LabSelect,LabToolbar,LabTimeline,LabStage,LabMessage,LabNote,LabScreen} from './LabUI';
import {FlowDiagram,type FlowEdge} from './FlowDiagram';
import {RequestOverview,ProtocolExchange} from './RequestDetails';
import LearningExtras from './LearningExtras';
import EdgeCases from './EdgeCases';
import ProtocolState from './ProtocolState';

const stages = [
  {name:'آماده‌سازی درخواست',short:'مرورگر',from:0,to:0,label:'تجزیهٔ آدرس و تعیین نوع درخواست',detail:'مرورگر آدرس را تجزیه می‌کند، متد درخواست را انتخاب می‌کند و حافظهٔ نهان خود را بررسی می‌کند. در این شبیه‌سازی فرض می‌کنیم داده در حافظهٔ نهان نیست و اتصال جدیدی لازم است.'},
  {name:'یافتن نشانی IP دامنه',short:'DNS',from:0,to:1,label:'یافتن نشانی IP با DNS',detail:'حل‌کنندهٔ DNS نشانی IP نام میزبان را پیدا می‌کند و برمی‌گرداند. مسیر URL بخشی از DNS نیست. اگر پاسخ قبلاً ذخیره شده باشد، ممکن است نیازی به جست‌وجوی مجدد نباشد.'},
  {name:'برقراری اتصال TCP',short:'TCP',from:0,to:2,label:'ACK ← SYN-ACK ← SYN',detail:'کلاینت و سرور با دست‌دهی سه‌مرحله‌ای، یک جریان بایت قابل‌اعتماد برقرار می‌کنند.'},
  {name:'امن‌سازی اتصال',short:'TLS',from:0,to:2,label:'دست‌دهی TLS',detail:'کلاینت گواهی سرور را اعتبارسنجی می‌کند و کلیدهای رمزنگاری را با سرور توافق می‌کند. HTTPS از پیام‌های HTTP هنگام انتقال محافظت می‌کند.'},
  {name:'ارسال درخواست HTTP',short:'درخواست',from:0,to:2,label:'درخواست رمزنگاری‌شدهٔ HTTP',detail:'درخواست شامل متد، مسیر، سرآیندها و گاهی بدنه است. پراکسی مرزی درخواست را دریافت می‌کند.'},
  {name:'اجرای منطق برنامه',short:'برنامه',from:2,to:3,label:'پراکسی، مسیریابی و پردازش',detail:'پراکسی درخواست را به برنامه می‌فرستد. برنامه مسیر مناسب را پیدا می‌کند، دسترسی و ورودی را اعتبارسنجی می‌کند و منطق کسب‌وکار را اجرا می‌کند.'},
  {name:'دسترسی به داده‌ها',short:'پایگاه داده',from:3,to:4,label:'خواندن یا نوشتن داده و دریافت نتیجه',detail:'برنامه در صورت نیاز از پایگاه داده یا حافظهٔ نهان داده می‌گیرد. بعضی درخواست‌ها اصلاً به دسترسی به داده نیاز ندارند.'},
  {name:'بازگرداندن پاسخ HTTP',short:'پاسخ',from:3,to:0,label:'کد وضعیت، سرآیندها و بدنه',detail:'برنامه نتیجه را از طریق پراکسی به مرورگر برمی‌گرداند. کد وضعیت نشان می‌دهد درخواست چه نتیجه‌ای داشته است.'},
  {name:'به‌روزرسانی مرورگر',short:'نمایش',from:0,to:0,label:'تجزیهٔ پاسخ و به‌روزرسانی رابط',detail:'مرورگر یا کلاینت جاوااسکریپت پاسخ را تجزیه می‌کند، رابط کاربری را به‌روز می‌کند و در صورت مجاز بودن، پاسخ را در حافظهٔ نهان ذخیره می‌کند.'}
];
const nodes = [
  {x:700,y:220,label:'مرورگر',sub:'کلاینت',icon:'browser'},
  {x:500,y:78,label:'حل‌کنندهٔ DNS',sub:'تبدیل نام به IP',icon:'dns'},
  {x:500,y:220,label:'پراکسی مرزی',sub:'اتصال',icon:'proxy'},
  {x:295,y:220,label:'سرور برنامه',sub:'منطق کسب‌وکار',icon:'app'},
  {x:90,y:220,label:'پایگاه داده',sub:'ذخیره‌سازی',icon:'db'}
];
const scenarios = {
  get:{method:'GET',path:'/api/products/42',status:'200 OK',body:'{"id":42,"name":"Keyboard"}'},
  post:{method:'POST',path:'/api/products',status:'201 Created',body:'{"id":43,"name":"Mouse"}'},
  missing:{method:'GET',path:'/api/products/999',status:'404 Not Found',body:'{"error":"Product not found"}'},
  error:{method:'GET',path:'/api/products/42',status:'500 Internal Server Error',body:'{"error":"Unexpected server error"}'},
  conflict:{method:'POST',path:'/api/products',status:'409 Conflict',body:'{"error":"Product name already exists"}'}
};
type Scenario = keyof typeof scenarios;
const edges:FlowEdge[]=[[0,1],[0,2],[2,3],[3,4]];
const compactLayout={width:360,height:482,positions:[
  {x:265,y:60},{x:95,y:60},{x:265,y:205},{x:95,y:205},{x:95,y:350}
]};
const stageNotes=[
  {phase:'آماده‌سازی',result:'آدرس و متد مشخص شده‌اند.',example:'https://shop.example/api/products/42'},
  {phase:'آماده‌سازی',result:'نشانی سرور پیدا شده است.',example:'shop.example → 192.0.2.10'},
  {phase:'برقراری ارتباط',result:'اتصال TCP آماده است.',example:'SYN / SYN-ACK / ACK'},
  {phase:'برقراری ارتباط',result:'کانال رمزنگاری‌شده آماده است.',example:'TLS · HTTPS'},
  {phase:'ارسال و پردازش',result:'درخواست به پراکسی رسیده است.',example:'HTTP/1.1'},
  {phase:'ارسال و پردازش',result:'مسیر و منطق درخواست مشخص شده‌اند.',example:'Route → Handler'},
  {phase:'ارسال و پردازش',result:'عملیات داده انجام می‌شود.',example:'Database query'},
  {phase:'دریافت نتیجه',result:'پاسخ به مرورگر برمی‌گردد.',example:'Status + Headers + Body'},
  {phase:'دریافت نتیجه',result:'چرخهٔ درخواست کامل شده است.',example:'Parse → Render'}
];
const scenarioOptions=[{value:'get',label:'دریافت موفق · GET ۲۰۰'},{value:'post',label:'ایجاد موفق · POST ۲۰۱'},{value:'missing',label:'یافت نشد · GET ۴۰۴'},{value:'error',label:'خطای سرور · GET ۵۰۰'},{value:'conflict',label:'تداخل داده · POST ۴۰۹'}];
export default function RequestLab(){
  const playback=usePlayback(stages.length);
  const {step,playing,speed,jump,pause}=playback;
  const [scenario,setScenario]=useState<Scenario>('get');
  const selectScenario=(id:string)=>{setScenario(id as Scenario);jump(0);};
  const s=scenarios[scenario],stage=stages[step];
  const route=stage.from===stage.to?[]:step===7?[nodes[stage.from],nodes[2],nodes[stage.to]]:[nodes[stage.from],nodes[stage.to]];
  const returnRoute=[1,2,3,6].includes(step)?[...route].reverse():undefined;
  const packetLabel=step===1?'DNS':step===2?'TCP':step===3?'TLS':step===4?s.method:step===5?'HTTP':step===6?'DB':step===7?s.status.split(' ')[0]:undefined;
  const responseVisible=step>=7;
  const outcome=Number(s.status.slice(0,3))>=400?'error':'success';
  const activeNodes=step===7?[0,2,3]:[stage.from,stage.to];
  const accent=step>=7&&outcome==='error'?'var(--danger)':step===7?'var(--blue)':'var(--accent)';
  const example=step===0?'https://shop.example'+s.path:step===4?s.method+' '+s.path:step>=7?s.status:stageNotes[step].example;
  const requestBody=s.method==='POST'?'{"name":"Mouse"}':'';
  const request=s.method+' '+s.path+' HTTP/1.1\nHost: shop.example\nAccept: application/json'+(requestBody?'\nContent-Type: application/json\nContent-Length: '+requestBody.length+'\n\n'+requestBody:'\n');
  const response='HTTP/1.1 '+s.status+'\nContent-Type: application/json\nContent-Length: '+s.body.length+'\nCache-Control: no-store\n\n'+s.body;

  const detail=step===6&&scenario==='conflict'?'در این فروشگاه نام محصول باید یکتا باشد. محصول Mouse از قبل وجود دارد؛ پایگاه داده درج رکورد تکراری را رد می‌کند و سرور پاسخ ۴۰۹ آماده می‌کند.':step===8&&scenario==='conflict'?'مرورگر پاسخ ۴۰۹ را دریافت می‌کند و باید به کاربر توضیح دهد که نام محصول تکراری است؛ نباید پیام ایجاد موفق نشان دهد.':step===6&&scenario==='error'?'عملیات پایگاه داده به‌طور غیرمنتظره شکست می‌خورد. برنامه خطا را به پاسخ عمومی ۵۰۰ تبدیل می‌کند.':step===8&&scenario==='missing'?'کلاینت یک پاسخ معتبر HTTP دریافت می‌کند، اما محصول موردنظر پیدا نشده است. رابط کاربری می‌تواند پیام «یافت نشد» را نمایش دهد.':stage.detail;
  const explanation=[
    'فرض کنید در فروشگاه اینترنتی روی یک محصول کلیک می‌کنید. مرورگر ابتدا نام میزبان shop.example و مسیر '+s.path+' را از URL جدا می‌کند. متد '+s.method+' هدف عملیات را تعیین می‌کند.',
    'مرورگر فقط برای نام shop.example سؤال DNS می‌فرستد؛ پاسخ نمونه 192.0.2.10 است. این نشانی مستنداتی است، نه یک سرویس واقعی.',
    'کلاینت SYN می‌فرستد، پراکسی SYN-ACK را برمی‌گرداند و کلاینت ACK نهایی را می‌فرستد. سه پیام اتصال TCP را برقرار می‌کنند؛ هنوز GET یا POST ارسال نشده است.',
    'در دست‌دهی TLS کلاینت و سرور دربارهٔ کلیدها توافق می‌کنند. مرورگر گواهی نام دامنه را می‌سنجد؛ بعد از آن متن HTTP در مسیر رمزنگاری می‌شود.',
    'به خط اول پنل درخواست نگاه کنید: '+s.method+' '+s.path+' HTTP/1.1. Host مقصد و Accept قالب پاسخ دلخواه را معرفی می‌کند؛ POST در این مثال بدنهٔ JSON هم دارد.',
    'پراکسی درخواست را به سرور برنامه منتقل می‌کند. برنامه مسیر را با handler متناظر تطبیق می‌دهد و قبل از دسترسی به داده، ورودی و مجوز را بررسی می‌کند.',
    scenario==='conflict'?'درج محصول Mouse با شرط یکتایی نام تداخل دارد. تراکنش درج ناموفق می‌شود و محصول تکراری ایجاد نمی‌شود.':scenario==='post'?'در این نمونه دادهٔ نام Mouse ذخیره می‌شود و شناسهٔ 43 تولید می‌شود.':scenario==='missing'?'درخواست خواندن محصول 999 معتبر است، ولی جست‌وجو هیچ رکوردی پیدا نمی‌کند.':scenario==='error'?'خرابی داخلی دیتابیس مانع خواندن می‌شود. جزئیات exception باید در لاگ سرور بماند.':'برنامه رکورد محصول 42 را می‌خواند و نام Keyboard را دریافت می‌کند.',
    'پاسخ '+s.status+' از سرور برنامه به پراکسی و سپس مرورگر می‌رسد. خط وضعیت، سرآیندها و بدنهٔ JSON نتیجه را توضیح می‌دهند.',
    'مرورگر بر اساس '+s.status+' تصمیم می‌گیرد چه چیزی نمایش دهد؛ پاسخ خطا هم یک پیام معتبر HTTP است. رابط کاربری باید وضعیت موفق یا خطا را درست منعکس کند.'
  ][step];
  const result=step===6&&scenario==='conflict'?'درج تکراری رد شد.':step===6&&scenario==='error'?'عملیات داده ناموفق بود.':stageNotes[step].result;
  const connectionState=step===0?'URL parsed':step===1?'DNS resolved':step===2?'TCP established':'HTTPS ready';
  const requestState=step<4?'Not sent':step===4?'At edge proxy':step===5?'At application':step===6?'Database operation':'Completed';
  return <LabScreen label="آموزش تعاملی درخواست HTTP"
    overview={<RequestOverview method={s.method} path={s.path} status={responseVisible?s.status:undefined} outcome={outcome}/>}
    graphFooter={<ProtocolExchange phase={stageNotes[step].phase} result={result} example={example}/>}
    
    toolbar={<LabToolbar playback={playback} count={stages.length} actions={<><LearningExtras pitfall="وجود یک پاسخ HTTP به معنای موفقیت عملیات نیست؛ پاسخ ۴۰۴ یا ۵۰۰ نیز یک پاسخ معتبر HTTP است. اتصال TCP ممکن است برای درخواست‌های بعدی دوباره استفاده شود." takeaway="DNS نشانی را پیدا می‌کند، TCP و TLS ارتباط را آماده می‌کنند و HTTP معنای درخواست و پاسخ را تعیین می‌کند." quiz={{question:'کدام مرحله نشانی IP نام دامنه را پیدا می‌کند؟',options:['TLS','DNS','HTTP'],correct:1,explanation:'DNS نام میزبان را به رکوردهایی مانند IP نگاشت می‌کند.'}} references={[{label:'RFC 9110 — HTTP semantics',url:'https://www.rfc-editor.org/rfc/rfc9110.html'},{label:'RFC 9112 — HTTP/1.1',url:'https://www.rfc-editor.org/rfc/rfc9112.html'}]} onOpen={pause}/><EdgeCases current={scenario} onSelect={selectScenario} onOpen={pause} cases={[{id:'missing',label:'محصول ناموجود · ۴۰۴',explanation:'سرور سالم است اما محصول مورد نظر وجود ندارد.'},{id:'error',label:'خطای داخلی · ۵۰۰',explanation:'عملیات داده با خطای غیرمنتظره شکست می‌خورد.'},{id:'conflict',label:'تداخل داده · ۴۰۹',explanation:'درخواست ایجاد معتبر است اما نام محصول از قبل وجود دارد.'}]}/></>}><LabSelect label="سناریو" value={scenario} options={scenarioOptions} onChange={selectScenario}/></LabToolbar>}
    graph={<FlowDiagram nodes={nodes} edges={edges} activeNodes={activeNodes} route={route} playing={playing} speed={speed} accent={accent} animationKey={step+'-'+scenario+'-'+speed} label={stage.name} caption={stage.label} captionDirection={step===2?'ltr':'rtl'} returnRoute={returnRoute} finalRoute={step===2?route:undefined} packetLabel={packetLabel} compactLayout={compactLayout}/>}
    detail={<><LabStage name={stage.name} label={stage.short} explanation={explanation} route={(step===2?[...route,...route.slice(0,-1).reverse(),...route.slice(1)]:returnRoute?[...route,...returnRoute.slice(1)]:route.length?route:[nodes[0]]).map(n=>n.label)} result={result} next={stages[step+1]?.name}>{detail}</LabStage><ProtocolState kind="http-request" title="وضعیت درخواست در مسیر" labels={['آمادگی اتصال','محل پردازش','پاسخ مرورگر']} values={[connectionState,requestState,responseVisible?s.status:'Pending']} context="برقراری اتصال، پردازش درخواست و دریافت پاسخ سه وضعیت جدا هستند. دریافت یک پاسخ HTTP به معنی موفقیت عملیات نیست." step={step} tone={responseVisible?outcome:undefined}/><LabMessage title="درخواست" content={step>=4?request:undefined} waiting="هنوز درخواست HTTP ارسال نشده است." tag={step>=4?s.method:undefined}/><LabMessage title="پاسخ" content={responseVisible?response:undefined} waiting="هنوز پاسخی از سرور دریافت نشده است." tag={responseVisible?s.status.slice(0,3):undefined} tone={responseVisible?outcome:undefined}/><LabNote>شبیه‌سازی یک اتصال جدید HTTPS با HTTP/1.1 و TCP؛ بدون ارسال درخواست واقعی. در عمل اتصال‌ها قابل استفادهٔ مجدد هستند و HTTP/3 از QUIC استفاده می‌کند.</LabNote></>}
    timeline={<LabTimeline steps={stages} step={step} onChange={jump} label="مراحل درخواست"/>}/>;
}
