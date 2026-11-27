import type {BackendLesson} from '../backend/types';
import type {DeepLesson,TraceCase,TraceEvent} from '../deep/types';
type Row=[name:string,route:number[],messages:string[],input:string,output:string,state:string[],why:string,diagnostic:string,tone?:'error'|'success'];
type Main=[id:string,label:string,prediction:string,example:string,rows:Row[],edgeCase?:string];
type Event=[at:number,lane:number,to:number|null,name:string,wire:string,why:string,patch:Record<string,string|number>,tone?:'error'|'success'];
type Case=[id:string,label:string,initial:Record<string,string|number>,events:Event[],verdict:string];
type Question=[question:string,options:string[],correct:number,explanation:string];
type Spec={slug:string;title:string;description:string;order:number;actors:[string,string,string][];edges:[number,number][];labels:string[];context:string;goal:string;scenarios:Main[];pitfall:string;takeaway:string;quiz:Question;practice:Question;hint:string;terms:string[][];references:[string,string][];exercise:[string,string,string,string];deep:{title:string;question:string;assumptions:string;lanes:string[];fields:Record<string,string>;code:string;cases:Case[];diagnose:string;tradeoff:string}};
export const pathSlugs=['solid','singleton','factory','strategy','observer','dependency-injection','repository-pattern','clean-architecture','monolith-microservices','event-driven-architecture','reverse-proxy','load-balancing','scaling','cdn','message-queue','rate-limiting','circuit-breaker','distributed-lock','cap-theorem','raft'];
export const categoryFor=(order:number)=>order<=35?'design-patterns':order<=40?'architecture':'system-design';
const q=([question,options,correct,explanation]:Question)=>({question,options,correct,explanation});
export function author(s:Spec):{lesson:BackendLesson;deep:DeepLesson}{
 const refs=s.references.map(([label,url])=>({label,url}));
 const next=pathSlugs[s.order-30];
 const lesson:BackendLesson={slug:s.slug,title:s.title,description:s.description,order:s.order,model:s.order<=40?'architecture':'distributed',actors:s.actors.map(([label,sub,icon])=>({label,sub,icon})),edges:s.edges,
 visual:{title:'وضعیت مدل پس از مرحله',labels:s.labels,context:s.context},teaching:{goal:s.goal,terms:s.terms,practice:{...q(s.practice),hint:s.hint}},
 scenarios:s.scenarios.map(([id,label,prediction,example,rows,edgeCase])=>({id,label,prediction,example,edgeCase,steps:rows.map(([name,route,flightLabels,input,output,state,why,diagnostic,tone])=>({name,short:name,detail:why,route,packet:flightLabels[0],input,output,state,result:output,explanation:why,diagnostic,flightLabels,roundTrip:flightLabels.length===2*(route.length-1)&&route.length>1,tone}))})),
 pitfall:s.pitfall,takeaway:s.takeaway,quiz:q(s.quiz),references:refs,field:{task:s.exercise[0],command:s.exercise[1],observe:s.exercise[2],limit:s.exercise[3],...(next?{next:{slug:next,label:next.replaceAll('-',' '),category:categoryFor(s.order+1)}}:{})}};
 const deep:DeepLesson={slug:s.slug,...s.deep,sources:refs,cases:s.deep.cases.map(([id,label,initial,events,verdict]):TraceCase=>({id,label,initial,verdict,events:events.map(([at,lane,to,name,wire,why,patch,tone]):TraceEvent=>({at,lane,...(to===null?{}:{to}),name,wire,why,patch,tone}))}))};
 return {lesson,deep};
}
