export type Actor={label:string;sub:string;icon:string};
export type Exchange={name:string;short:string;detail:string;route:number[];packet:string;input:string;output:string;result:string;explanation?:string;roundTrip?:boolean;tone?:'error'|'success'};
export type Scenario={id:string;label:string;example:string;steps:Exchange[];edgeCase?:string};
export type NetworkLesson={slug:string;title:string;description:string;order:number;actors:Actor[];edges:[number,number][];scenarios:Scenario[];pitfall:string;takeaway:string;quiz:{question:string;options:string[];correct:number;explanation:string};references:{label:string;url:string}[]};
