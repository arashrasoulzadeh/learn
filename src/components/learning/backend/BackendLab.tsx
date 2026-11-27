import {useState} from 'react';
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
 const {step,playing,speed,jump,pause}=playback;
 const stage=scenario.steps[step]??scenario.steps[0];
 const select=(value:string)=>{setId(value);jump(0);};
 const actors=scenario.actors??lesson.actors,edges=scenario.edges??lesson.edges;
 const nodes:FlowNode[]=actors.map((a,i)=>({...a,x:lesson.slug==='event-loop'?[650,285,285][i]:700-i*610/(actors.length-1),y:lesson.slug==='event-loop'?[175,95,250][i]:175}));
 const compactLayout={width:360,height:Math.ceil(nodes.length/2)*145+47,positions:lesson.slug==='event-loop'?[{x:265,y:132},{x:95,y:60},{x:95,y:205}]:nodes.map((_,i)=>({x:i%2===0?265:95,y:60+Math.floor(i/2)*145}))};
 const route=stage.route.map(i=>nodes[i]);
 const accent=stage.tone==='error'?'var(--danger)':'var(--accent)';
 return <div className="network-lab backend-lab" data-lesson={lesson.slug} data-model={lesson.model}>
 <LabScreen label={lesson.title+' — آموزش تعاملی'} stepKey={id+'-'+step}
 toolbar={<LabToolbar playback={playback} count={scenario.steps.length} actions={<><LearningExtras pitfall={lesson.pitfall} takeaway={lesson.takeaway} quiz={lesson.quiz} references={lesson.references} terms={lesson.teaching.terms} fieldExercise={lesson.field} onOpen={pause}/><EdgeCases current={id} onSelect={select} onOpen={pause} cases={lesson.scenarios.filter(s=>s.edgeCase).map(s=>({id:s.id,label:s.label,explanation:s.edgeCase!}))}/></>}><LabSelect label="سناریو" value={id} options={lesson.scenarios.map(s=>({value:s.id,label:s.label}))} onChange={select}/></LabToolbar>}
 overview={<><div className="network-overview"><strong>{scenario.label}</strong><code dir="ltr">{scenario.example}</code></div><div className="backend-prediction" aria-label="سؤال پیش‌بینی"><span>قبل از مشاهدهٔ نتیجه</span><p>{scenario.prediction}</p></div></>}
 graph={<FlowDiagram nodes={nodes} edges={edges} activeNodes={stage.route} route={route} playing={playing} speed={speed} accent={accent} animationKey={id+'-'+step+'-'+speed} label={stage.name} caption={stage.name} returnRoute={stage.roundTrip?[...route].reverse():undefined} packetLabel={stage.packet} compactLayout={compactLayout}/>}
 graphFooter={<ProtocolExchange phase={stage.short} result={stage.result} example={stage.packet}/>}
 detail={<><LearningGoal goal={lesson.teaching.goal}/><LabStage name={stage.name} label={stage.short} explanation={stage.explanation} route={(stage.roundTrip?[...stage.route,...stage.route.slice(0,-1).reverse()]:stage.route).map(i=>actors[i].label)} result={stage.result} next={scenario.steps[step+1]?.name} visual={<ProtocolState kind={scenario.id==='isolation'?'process-isolation':lesson.slug} title={lesson.visual.title} labels={scenario.id==='isolation'?['فرایند A','کانال IPC','فرایند B']:lesson.visual.labels} values={stage.state} context={lesson.visual.context} step={step} tone={stage.tone}/>}>{stage.detail}</LabStage><LabMessage title="کد یا ورودی نمونه" content={stage.input} waiting="آماده‌سازی"/><LabMessage title="اثر قابل مشاهده" content={stage.output} waiting="در انتظار نتیجه" tone={stage.tone}/>{step===scenario.steps.length-1&&<PracticeCheck key={id} practice={lesson.teaching.practice} nextLesson={lesson.field.next}/>}<LabNote>{lesson.description} این مدل آموزشی است؛ کد یا درخواست واقعی اجرا نمی‌شود.</LabNote></>}
 timeline={<LabTimeline steps={scenario.steps} step={step} onChange={jump} label="مراحل درس"/>}/>
 </div>;
}
