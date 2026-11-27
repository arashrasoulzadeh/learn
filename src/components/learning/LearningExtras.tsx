import Quiz from './Quiz';
import LabDialog from './LabDialog';
import type {FieldExercise} from './network/fieldExercises';
type Props={pitfall:string;takeaway:string;quiz:{question:string;options:string[];correct:number;explanation:string};references:{label:string;url:string}[];onOpen?:()=>void;terms?:string[][];fieldExercise?:FieldExercise};
export default function LearningExtras({pitfall,takeaway,quiz,references,onOpen,terms,fieldExercise}:Props){
  return <LabDialog label="نکته‌ها و منابع" title="مرور و تکمیل یادگیری" onOpen={onOpen}>{()=> <>
    <details className="network-extra" open><summary>نکته و جمع‌بندی</summary><p>{pitfall}</p><p>{takeaway}</p></details>
    <details className="network-extra"><summary>سنجش یادگیری</summary><Quiz {...quiz}/></details>
    {terms&&<details className="network-extra"><summary>واژه‌نامهٔ درس</summary><dl className="lesson-glossary">{terms.map(([term,meaning])=><div key={term}><dt dir="ltr">{term}</dt><dd>{meaning}</dd></div>)}</dl></details>}
    {fieldExercise&&<details className="network-extra field-exercise"><summary>تمرین عملی خارج از شبیه‌سازی</summary><p>{fieldExercise.task}</p>{fieldExercise.command&&<pre dir="ltr">{fieldExercise.command}</pre>}<strong>چه چیزی باید مشاهده کنید؟</strong><p>{fieldExercise.observe}</p><small>{fieldExercise.limit}</small></details>}
    <details className="network-extra"><summary>منابع بیشتر</summary>{references.map(ref=><a key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer">{ref.label} ↗</a>)}</details>
  </>}</LabDialog>;
}
