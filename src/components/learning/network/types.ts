export type Actor={label:string;sub:string;icon:string};
export type Exchange={name:string;short:string;detail:string;route:number[];packet:string;input:string;output:string;result:string;explanation?:string;state:string[];roundTrip?:boolean;flightLabels?:string[];drop?:boolean;diagnostic?:string;tone?:'error'|'success'};
export type Scenario={id:string;label:string;example:string;steps:Exchange[];edgeCase?:string};
export type ProtocolVisual={title:string;labels:string[];context:string};
export type NetworkLesson={teaching:{goal:string;practice:{question:string;options:string[];correct:number;explanation:string;hint:string};terms:string[][]};visual:ProtocolVisual;slug:string;title:string;description:string;order:number;actors:Actor[];edges:[number,number][];scenarios:Scenario[];pitfall:string;takeaway:string;quiz:{question:string;options:string[];correct:number;explanation:string};references:{label:string;url:string}[]};
