export type TraceValue=string|number;
export type TraceEvent={at:number;lane:number;to?:number;name:string;wire:string;why:string;patch:Record<string,TraceValue>;tone?:'error'|'success'};
export type TraceCase={id:string;label:string;initial:Record<string,TraceValue>;events:TraceEvent[];verdict:string};
export type DeepLesson={slug:string;title:string;question:string;assumptions:string;code:string;lanes:string[];fields:Record<string,string>;cases:TraceCase[];diagnose:string;tradeoff:string;sources:{label:string;url:string}[]};
export function snapshot(c:TraceCase,step:number){
 const result={...c.initial};
 for(const event of c.events.slice(0,step))Object.assign(result,event.patch);
 return result;
}
