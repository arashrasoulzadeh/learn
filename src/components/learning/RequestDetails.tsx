type Outcome='success'|'error';
export function RequestOverview({method,path,status,outcome}:{method:string;path:string;status?:string;outcome:Outcome}){
  return <div className="request-overview" aria-label="خلاصهٔ درخواست">
    <div className="request-address"><span className="request-method" dir="ltr">{method}</span><code dir="ltr">https://shop.example{path}</code></div>
    <div className="request-result" data-tone={status?outcome:'pending'}><span className="request-result-dot" aria-hidden="true"/><span>{status?<bdi dir="ltr">{status}</bdi>:'در حال طی مراحل'}</span></div>
  </div>;
}
export function ProtocolExchange({phase,result,example}:{phase:string;result:string;example:string}){
  return <div className="protocol-exchange">
    <div><span className="protocol-kicker">{phase}</span><strong>{result}</strong></div>
    <code dir="ltr">{example}</code>
  </div>;
}
