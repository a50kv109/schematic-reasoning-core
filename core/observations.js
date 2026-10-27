import {validateCapabilities} from './provider-registry.js';
const finitePoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
export function normalizeObservations(items,{provider,source,coordinateFrames,capabilities}={}) {
  if(!Array.isArray(items)) throw new Error('Provider observations must be an array.');
  const caps=validateCapabilities(capabilities), frames=new Set(coordinateFrames.map(f=>f.id));
  return items.map((x,i)=>{
    if(!x||typeof x.objectType!=='string') throw new Error(`Observation ${i} requires objectType.`);
    if(x.sourceId!==source.sourceId) throw new Error(`Observation ${i} sourceId does not match input source.`);
    const q=x.quality??'qualitative'; if(!['approximate','exact-tool','human','derived','qualitative'].includes(q)) throw new Error(`Observation ${i} has invalid quality.`);
    let geometry=x.geometry??null;
    if(geometry!==null){ if(!x.coordinateFrameId||!frames.has(x.coordinateFrameId)) throw new Error(`Observation ${i} uses an undeclared coordinate frame.`); if(!(finitePoint(geometry)||finitePoint(geometry.a)&&finitePoint(geometry.b)||Array.isArray(geometry.points)&&geometry.points.every(finitePoint)||geometry.bounds&&[geometry.bounds.x,geometry.bounds.y,geometry.bounds.width,geometry.bounds.height].every(Number.isFinite))) throw new Error(`Observation ${i} has malformed geometry.`); }
    if(q==='approximate'&&!caps.approximateLocalization) throw new Error(`Provider did not declare approximateLocalization for observation ${i}.`);
    if(q==='exact-tool'&&!caps.exactToolCoordinates) throw new Error(`Provider did not declare exactToolCoordinates for observation ${i}.`);
    if(q==='qualitative'&&geometry!==null) throw new Error(`Qualitative observation ${i} cannot carry coordinates.`);
    const confidence=x.confidence??null; if(confidence!==null&&(!Number.isFinite(confidence)||confidence<0||confidence>1)) throw new Error(`Observation ${i} confidence must be null or in [0,1].`);
    return {observationId:x.observationId??`obs-${i+1}`,objectType:x.objectType,geometry:geometry?structuredClone(geometry):null,coordinateFrameId:x.coordinateFrameId??null,sourceId:source.sourceId,providerId:provider.manifest.providerId,quality:q,confidence,uncertainty:x.uncertainty??null,evidence:x.evidence??[],limitations:[...(x.limitations??[])],text:x.text??null,requiresConfirmation:Boolean(x.requiresConfirmation)||q==='qualitative'};
  });
}
