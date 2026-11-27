import {useState} from 'react';
import DeepLab from '../deep/DeepLab';
import {mainTitles} from '../mainTitles';
import {usePlayback,LabSelect,LabToolbar,LabTimeline,LabStage,LabMessage,LabNote,LabScreen} from '../LabUI';
import {FlowDiagram,type FlowNode} from '../FlowDiagram';
import {ProtocolExchange} from '../RequestDetails';
import LearningExtras from '../LearningExtras';
import EdgeCases from '../EdgeCases';
import ProtocolState from '../ProtocolState';
import {LearningGoal,PracticeCheck} from '../TeachingTools';
import {fieldExercises} from './fieldExercises';
import type {NetworkLesson} from './types';

export default function NetworkLab({lesson}:{lesson:NetworkLesson}){
  const [scenarioId,setScenarioId]=useState(lesson.scenarios[0].id);
  const scenario=lesson.scenarios.find(s=>s.id===scenarioId)??lesson.scenarios[0];
  const playback=usePlayback(scenario.steps.length,6500);
  const {step,playing,speed,jump,pause,preview,motionVersion,replayStep}=playback;
  const selectScenario=(id:string)=>{setScenarioId(id);jump(0);};
  const stage=scenario.steps[step]??scenario.steps[0];
  const count=lesson.actors.length;
  const nodes:FlowNode[]=lesson.actors.map((actor,i)=>({...actor,x:lesson.slug==='dns'?[700,475,200,200,200][i]:700-i*610/(count-1),y:lesson.slug==='dns'?[145,145,44,145,246][i]:175}));
  const positions=lesson.slug==='dns'?[{x:265,y:60},{x:265,y:205},{x:95,y:60},{x:95,y:205},{x:95,y:350}]:lesson.actors.map((_,i)=>({x:i%2===0?265:95,y:60+Math.floor(i/2)*145}));
  const compactLayout={width:360,height:Math.ceil(count/2)*145+47,positions};
  const route=stage.route.map(i=>nodes[i]);
  const activeNodes=stage.route;
  const accent=stage.tone==='error'?'var(--danger)':stage.tone==='success'?'var(--blue)':'var(--accent)';
  return <div className="network-lab" data-lesson={lesson.slug}>
    <LabScreen graphTitle={mainTitles[lesson.slug]} headingActions={<DeepLab slug={lesson.slug} onOpen={pause}/>} label={lesson.title+' — آموزش تعاملی'}
      toolbar={<LabToolbar playback={playback} count={scenario.steps.length} actions={<><LearningExtras pitfall={lesson.pitfall} takeaway={lesson.takeaway} quiz={lesson.quiz} references={lesson.references} terms={lesson.teaching.terms} fieldExercise={fieldExercises[lesson.slug]} onOpen={pause}/><EdgeCases cases={lesson.scenarios.filter(s=>s.edgeCase).map(s=>({id:s.id,label:s.label,explanation:s.edgeCase!}))} current={scenario.id} onSelect={selectScenario} onOpen={pause}/></>}><LabSelect label="سناریو" value={scenario.id} options={lesson.scenarios.map(s=>({value:s.id,label:s.label}))} onChange={selectScenario}/></LabToolbar>}
      overview={<><div className="network-overview"><strong>{scenario.label}</strong><code dir="ltr">{scenario.example}</code></div>{scenario.prediction&&<div className="backend-prediction" aria-label="سؤال پیش‌بینی"><span>پیش‌بینی کنید</span><p>{scenario.prediction}</p></div>}</>}
      graph={<FlowDiagram nodes={nodes} edges={lesson.edges} activeNodes={activeNodes} route={route} playing={playing} preview={preview} motionVersion={motionVersion} onReplay={replayStep} flightLabels={stage.flightLabels} drop={stage.drop} speed={speed} accent={accent} animationKey={scenario.id+'-'+step+'-'+speed} label={stage.name} caption={stage.name} returnRoute={stage.roundTrip?[...route].reverse():undefined} packetLabel={stage.packet} compactLayout={compactLayout}/>}
      stateView={<ProtocolState showContext={false} kind={lesson.slug} title={lesson.visual.title} labels={lesson.visual.labels} values={stage.state} previousValues={step>0?scenario.steps[step-1]?.state:undefined} context={lesson.visual.context} step={step} tone={stage.tone}/>}
      graphFooter={<ProtocolExchange phase={stage.short} result={stage.result} example={stage.packet||scenario.example}/>}
      stepKey={scenario.id+'-'+step}
      detail={<>
        <LearningGoal goal={lesson.teaching.goal}/>
        <LabStage evidence={<><LabMessage title="دادهٔ ورودی / پیام" content={stage.input||undefined} waiting="هنوز پیامی ارسال نشده است."/>
        <LabMessage title="نتیجهٔ مرحله" content={stage.output||undefined} waiting="در انتظار نتیجه…" tone={stage.tone}/></>} context={lesson.visual.context} diagnostic={stage.diagnostic} name={stage.name} label={stage.short} explanation={stage.explanation} route={(stage.roundTrip?[...stage.route,...stage.route.slice(0,-1).reverse()]:stage.route).map(i=>lesson.actors[i].label)} result={stage.result} next={scenario.steps[step+1]?.name}>{stage.detail}</LabStage>
        
        
        {step===scenario.steps.length-1&&<PracticeCheck key={scenario.id} practice={lesson.teaching.practice} nextLesson={fieldExercises[lesson.slug]?.next}/>}
        <LabNote>{lesson.description}</LabNote>
      </>}
      timeline={<LabTimeline steps={scenario.steps} step={step} onChange={jump} label="مراحل درس"/>}/>
  </div>;
}
