import Quiz from './Quiz';
import LabDialog from './LabDialog';
type Props={pitfall:string;takeaway:string;quiz:{question:string;options:string[];correct:number;explanation:string};references:{label:string;url:string}[];onOpen?:()=>void};
export default function LearningExtras({pitfall,takeaway,quiz,references,onOpen}:Props){
  return <LabDialog label="نکته‌ها و منابع" title="مرور و تکمیل یادگیری" onOpen={onOpen}>{()=> <>
    <details className="network-extra" open><summary>نکته و جمع‌بندی</summary><p>{pitfall}</p><p>{takeaway}</p></details>
    <details className="network-extra"><summary>سنجش یادگیری</summary><Quiz {...quiz}/></details>
    <details className="network-extra"><summary>منابع بیشتر</summary>{references.map(ref=><a key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer">{ref.label} ↗</a>)}</details>
  </>}</LabDialog>;
}
