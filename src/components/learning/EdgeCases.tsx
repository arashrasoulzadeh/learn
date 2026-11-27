import LabDialog from './LabDialog';
export type EdgeOption={id:string;label:string;explanation:string};
export default function EdgeCases({cases,current,onSelect,onOpen}:{cases:EdgeOption[];current:string;onSelect:(id:string)=>void;onOpen?:()=>void}){
  return <LabDialog label="حالت‌های خاص" title="حالت‌های خاص و خطاها (Edge Cases)" onOpen={onOpen}>{close=><div className="edge-options">
    <p>یکی از حالت‌ها را انتخاب کنید تا شبیه‌سازی از ابتدا با همان شرایط اجرا شود.</p>
    {cases.map(item=><button type="button" className="edge-option" key={item.id} aria-pressed={current===item.id} onClick={()=>{onSelect(item.id);close();}}><strong>{item.label}</strong><span>{item.explanation}</span></button>)}
  </div>}</LabDialog>;
}
