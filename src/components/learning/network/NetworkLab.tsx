import {useState} from 'react';
import {usePlayback,LabSelect,LabToolbar,LabTimeline,LabStage,LabMessage,LabNote,LabScreen} from '../LabUI';
import {FlowDiagram,type FlowNode} from '../FlowDiagram';
import {ProtocolExchange} from '../RequestDetails';
import Quiz from '../Quiz';
import type {NetworkLesson} from './types';

export default function NetworkLab({lesson}:{lesson:NetworkLesson}){
  const [scenarioId,setScenarioId]=useState(lesson.scenarios[0].id);
  const scenario=lesson.scenarios.find(s=>s.id===scenarioId)??lesson.scenarios[0];
  const playback=usePlayback(scenario.steps.length,3600);
  const {step,playing,speed,jump}=playback;
  const stage=scenario.steps[step]??scenario.steps[0];
  const count=lesson.actors.length;
  const nodes:FlowNode[]=lesson.actors.map((actor,i)=>({...actor,x:count===5?[700,500,295,90,500][i]:700-i*610/(count-1),y:count===5&&i===4?68:190}));
  const positions=lesson.actors.map((_,i)=>({x:i%2===0?265:95,y:60+Math.floor(i/2)*145}));
  const compactLayout={width:360,height:Math.ceil(count/2)*145+47,positions};
  const route=stage.route.map(i=>nodes[i]);
  const activeNodes=stage.route;
  const accent=stage.tone==='error'?'var(--danger)':stage.tone==='success'?'var(--blue)':'var(--accent)';
  return <div className="network-lab" data-lesson={lesson.slug}>
    <LabScreen label={lesson.title+' — آموزش تعاملی'}
      toolbar={<LabToolbar playback={playback} count={scenario.steps.length}><LabSelect label="سناریو" value={scenario.id} options={lesson.scenarios.map(s=>({value:s.id,label:s.label}))} onChange={v=>{setScenarioId(v);jump(0);}}/></LabToolbar>}
      overview={<div className="network-overview"><strong>{scenario.label}</strong><code dir="ltr">{scenario.example}</code></div>}
      graph={<FlowDiagram nodes={nodes} edges={lesson.edges} activeNodes={activeNodes} route={route} playing={playing} speed={speed} accent={accent} animationKey={scenario.id+'-'+step+'-'+speed} label={stage.name} caption={stage.name} returnRoute={stage.roundTrip?[...route].reverse():undefined} packetLabel={stage.packet} compactLayout={compactLayout}/>}
      graphFooter={<ProtocolExchange phase={stage.short} result={stage.result} example={stage.packet||scenario.example}/>}
      detail={<>
        <LabStage name={stage.name} label={stage.short}>{stage.detail}</LabStage>
        <LabMessage title="دادهٔ ورودی / پیام" content={stage.input||undefined} waiting="هنوز پیامی ارسال نشده است."/>
        <LabMessage title="نتیجهٔ مرحله" content={stage.output||undefined} waiting="در انتظار نتیجه…" tone={stage.tone}/>
        <LabNote>{lesson.description}</LabNote>
        <details className="network-extra"><summary>نکته و جمع‌بندی</summary><p>{lesson.pitfall}</p><p>{lesson.takeaway}</p></details>
        <details className="network-extra"><summary>سنجش یادگیری</summary><Quiz {...lesson.quiz}/></details>
        <details className="network-extra"><summary>منابع بیشتر</summary>{lesson.references.map(ref=><a key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer">{ref.label} ↗</a>)}</details>
      </>}
      timeline={<LabTimeline steps={scenario.steps} step={step} onChange={jump} label="مراحل درس"/>}/>
  </div>;
}
