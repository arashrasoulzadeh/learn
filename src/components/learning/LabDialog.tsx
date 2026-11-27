import {useId,useRef,type ReactNode} from 'react';
export default function LabDialog({label,title,children,onOpen,icon}:{label:string;title:string;children:(close:()=>void)=>ReactNode;onOpen?:()=>void;icon?:ReactNode}){
  const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
  const titleId=useId();
  const close=()=>dialog.current?.close();
  return <div className="lab-dialog-wrap">
    <button ref={trigger} className="secondary lab-dialog-trigger" type="button" aria-haspopup="dialog" onClick={()=>{onOpen?.();dialog.current?.showModal();}}>{icon}{label}</button>
    <dialog ref={dialog} className="lab-dialog" dir="rtl" aria-labelledby={titleId} onClose={()=>trigger.current?.focus()} onClick={e=>{if(e.target===e.currentTarget)close();}}>
      <div className="lab-dialog-inner"><header><h2 id={titleId}>{title}</h2><button className="secondary" type="button" onClick={close} aria-label="بستن پنجره">×</button></header>{children(close)}</div>
    </dialog>
  </div>;
}
