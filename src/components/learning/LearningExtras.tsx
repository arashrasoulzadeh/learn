import Quiz from './Quiz';
type Props={pitfall:string;takeaway:string;quiz:{question:string;options:string[];correct:number;explanation:string};references:{label:string;url:string}[]};
export default function LearningExtras({pitfall,takeaway,quiz,references}:Props){
  return <>
    <details className="network-extra"><summary>نکته و جمع‌بندی</summary><p>{pitfall}</p><p>{takeaway}</p></details>
    <details className="network-extra"><summary>سنجش یادگیری</summary><Quiz {...quiz}/></details>
    <details className="network-extra"><summary>منابع بیشتر</summary>{references.map(ref=><a key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer">{ref.label} ↗</a>)}</details>
  </>;
}
