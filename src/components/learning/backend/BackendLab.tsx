import {useRef,useState} from 'react';
import ArchitectureWorkshop from '../advanced/ArchitectureWorkshop';
import {workshopFor} from '../advanced/workshops';
import DeepLab from '../deep/DeepLab';
import {mainTitles} from '../mainTitles';
import {usePlayback,LabSelect,LabToolbar,LabTimeline,LabStage,LabMessage,LabNote,LabScreen} from '../LabUI';
import {FlowDiagram,type FlowNode} from '../FlowDiagram';
import {ProtocolExchange} from '../RequestDetails';
import LearningExtras from '../LearningExtras';
import EdgeCases from '../EdgeCases';
import ProtocolState from '../ProtocolState';
import {LearningGoal,PracticeCheck} from '../TeachingTools';
import type {BackendLesson} from './types';

export default function BackendLab({lesson}:{lesson:BackendLesson}){
 const [id,setId]=useState(lesson.scenarios[0].id);
 const scenario=lesson.scenarios.find(s=>s.id===id)??lesson.scenarios[0];
 const playback=usePlayback(scenario.steps.length,8000);
 const {step,playing,speed,jump,pause,preview,motionVersion,replayStep}=playback;
 const stage=scenario.steps[step]??scenario.steps[0];
 const select=(value:string)=>{setId(value);jump(0);};
 const workshop=lesson.order>=31&&lesson.order<=40?workshopFor(lesson.slug,id):undefined;
 const traceHeading=useRef<HTMLHeadingElement>(null);
 const actors=scenario.actors??lesson.actors,edges=scenario.edges??lesson.edges;
 const fork=['event-loop','sharding','replication','database-locking','transactions-acid','b-tree','caching','cache-invalidation','database-index','observer','monolith-microservices','load-balancing','cap-theorem','raft','solid','factory'].includes(lesson.slug);
 const diamond=lesson.slug==='distributed-lock';
 const nodes:FlowNode[]=actors.map((a,i)=>({...a,x:diamond?[395,650,140,395][i]:fork&&actors.length===3?[650,285,285][i]:700-i*610/(actors.length-1),y:diamond?[70,175,175,280][i]:fork&&actors.length===3?[175,95,250][i]:175}));
 const compactLayout={width:360,height:diamond?423:Math.ceil(nodes.length/2)*145+47,positions:diamond?[{x:180,y:60},{x:265,y:205},{x:95,y:205},{x:180,y:350}]:fork&&actors.length===3?[{x:265,y:132},{x:95,y:60},{x:95,y:205}]:nodes.map((_,i)=>({x:i%2===0?265:95,y:60+Math.floor(i/2)*145}))};
 const route=stage.route.map(i=>nodes[i]);
 const accent=stage.tone==='error'?'var(--danger)':'var(--accent)';
 return <div className="network-lab backend-lab" data-lesson={lesson.slug} data-model={lesson.model}>
 <LabScreen graphTitle={mainTitles[lesson.slug]} headingActions={<DeepLab slug={lesson.slug} onOpen={pause}/>} label={lesson.title+' — آموزش تعاملی'} stepKey={id+'-'+step}
 toolbar={<LabToolbar playback={playback} count={scenario.steps.length} actions={<><LearningExtras pitfall={lesson.pitfall} takeaway={lesson.takeaway} quiz={lesson.quiz} references={lesson.references} terms={lesson.teaching.terms} fieldExercise={lesson.field} onOpen={pause}/><EdgeCases current={id} onSelect={select} onOpen={pause} cases={lesson.scenarios.filter(s=>s.edgeCase).map(s=>({id:s.id,label:s.label,explanation:s.edgeCase!}))}/></>}><LabSelect label="سناریو" value={id} options={lesson.scenarios.map(s=>({value:s.id,label:s.label}))} onChange={select}/></LabToolbar>}
 overview={<>{workshop&&<><ArchitectureWorkshop key={lesson.slug==='solid'?id:lesson.slug} workshop={workshop} onSimulation={()=>{traceHeading.current?.focus({preventScroll:true});traceHeading.current?.scrollIntoView({block:'start',behavior:'auto'});}}/><h2 ref={traceHeading} tabIndex={-1} className="architecture-trace-heading">شبیه‌سازی تکمیلی طراحی</h2></>}<div className="network-overview"><strong>{scenario.label}</strong><code dir="ltr">{scenario.example}</code></div><div className="backend-prediction" aria-label="سؤال پیش‌بینی"><span>قبل از مشاهدهٔ نتیجه</span><p>{scenario.prediction}</p></div></>}
 graph={<FlowDiagram nodes={nodes} edges={edges} activeNodes={stage.route} route={route} playing={playing} preview={preview} motionVersion={motionVersion} onReplay={replayStep} flightLabels={stage.flightLabels} drop={stage.drop} speed={speed} accent={accent} animationKey={id+'-'+step+'-'+speed} label={stage.name} caption={stage.name} returnRoute={stage.roundTrip?[...route].reverse():undefined} packetLabel={stage.packet} compactLayout={compactLayout}/>}
 stateView={<ProtocolState showContext={false} kind={scenario.id==='isolation'?'process-isolation':lesson.slug} title={lesson.visual.title} labels={scenario.id==='isolation'?['فرایند A','کانال IPC','فرایند B']:lesson.visual.labels} values={stage.state} previousValues={step>0?scenario.steps[step-1]?.state:undefined} context={lesson.visual.context} step={step} tone={stage.tone}/>}
      graphFooter={<ProtocolExchange phase={stage.short} result={stage.result} example={stage.packet}/>}
 detail={<><LearningGoal goal={lesson.teaching.goal}/><LabStage evidence={<><LabMessage title="کد یا ورودی نمونه" content={stage.input} waiting="آماده‌سازی"/><LabMessage title="اثر قابل مشاهده" content={stage.output} waiting="در انتظار نتیجه" tone={stage.tone}/></>} name={stage.name} label={stage.short} explanation={stage.explanation} route={(stage.roundTrip?[...stage.route,...stage.route.slice(0,-1).reverse()]:stage.route).map(i=>actors[i].label)} result={stage.result} next={scenario.steps[step+1]?.name} context={lesson.visual.context} diagnostic={stage.diagnostic}>{stage.detail}</LabStage>{step===scenario.steps.length-1&&<PracticeCheck key={id} practice={lesson.teaching.practice} nextLesson={lesson.field.next}/>}<LabNote>{lesson.description} این مدل آموزشی است؛ کد یا درخواست واقعی اجرا نمی‌شود.</LabNote></>}
 timeline={<LabTimeline steps={scenario.steps} step={step} onChange={jump} label="مراحل درس"/>}/>
 </div>;
}
