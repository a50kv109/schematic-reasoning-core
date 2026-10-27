const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function comparePointSets(predictions,references,{width,height}={}){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('Positive image dimensions required.');
  const p=new Map(predictions.map(x=>[x.id,x.point])),r=new Map(references.map(x=>[x.id,x.point]));
  const ids=[...r.keys()],errors=[],missed=[],ambiguous=[];
  for(const id of ids){const q=p.get(id);if(!q){missed.push(id);continue;}const ref=r.get(id);if(!Number.isFinite(q.x)||!Number.isFinite(q.y)||!Number.isFinite(ref.x)||!Number.isFinite(ref.y)){ambiguous.push(id);continue;}errors.push({id,errorPx:d(q,ref)});}
  const values=errors.map(x=>x.errorPx).sort((a,b)=>a-b),mean=values.length?values.reduce((a,b)=>a+b,0)/values.length:null,median=values.length?(values.length%2?values[(values.length-1)/2]:(values[values.length/2-1]+values[values.length/2])/2):null;
  return {matched:errors.length,referenceCount:references.length,predictionCount:predictions.length,missed,unmatchedPredictions:[...p.keys()].filter(id=>!r.has(id)),ambiguous,errors,meanAbsoluteEuclideanErrorPx:mean,medianErrorPx:median,maxErrorPx:values.at(-1)??null,imageDiagonalPx:Math.hypot(width,height),meanNormalizedByImageDiagonal:mean===null?null:mean/Math.hypot(width,height)};
}
export function compareSegments(predictions,references,options){
  const toPoints=items=>items.flatMap(x=>[{id:`${x.id}:a`,point:x.segment.a},{id:`${x.id}:b`,point:x.segment.b}]);
  const pred=toPoints(predictions),ref=toPoints(references);
  // Endpoint direction is not semantically meaningful; choose the lower-error pairing per matched segment.
  const pMap=new Map(predictions.map(x=>[x.id,x.segment])),rMap=new Map(references.map(x=>[x.id,x.segment]));
  const errors=[],missed=[],ambiguous=[];
  for(const [id,rs] of rMap){const ps=pMap.get(id);if(!ps){missed.push(id);continue;}const direct=[Math.hypot(ps.a.x-rs.a.x,ps.a.y-rs.a.y),Math.hypot(ps.b.x-rs.b.x,ps.b.y-rs.b.y)],reverse=[Math.hypot(ps.a.x-rs.b.x,ps.a.y-rs.b.y),Math.hypot(ps.b.x-rs.a.x,ps.b.y-rs.a.y)];errors.push({id,endpointErrorsPx:direct[0]+direct[1]<=reverse[0]+reverse[1]?direct:reverse});}
  const flatPred=predictions.flatMap(x=>[{id:`${x.id}:a`,point:x.segment.a},{id:`${x.id}:b`,point:x.segment.b}]),flatRef=references.flatMap(x=>[{id:`${x.id}:a`,point:x.segment.a},{id:`${x.id}:b`,point:x.segment.b}]);
  const result=comparePointSets(flatPred,flatRef,options),vals=errors.flatMap(e=>e.endpointErrorsPx).sort((a,b)=>a-b);
  return {...result,matched:errors.length,referenceCount:references.length,predictionCount:predictions.length,missed,unmatchedPredictions:predictions.filter(x=>!rMap.has(x.id)).map(x=>x.id),ambiguous,errors,meanAbsoluteEuclideanErrorPx:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null,medianErrorPx:vals.length?(vals.length%2?vals[(vals.length-1)/2]:(vals[vals.length/2-1]+vals[vals.length/2])/2):null,maxErrorPx:vals.at(-1)??null,meanNormalizedByImageDiagonal:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length/Math.hypot(options.width,options.height):null};
}
