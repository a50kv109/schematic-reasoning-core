export const CORE_API_VERSION = '1.0.0';
export const RESULT_SCHEMA_VERSION = 'schematic-reasoning-result/1';
export const PROVENANCE_KINDS = Object.freeze(['algorithm','human','analytic','derived','imported']);
export const VALIDATION_STATES = Object.freeze(['UNVERIFIED','VALIDATED','REJECTED','UNCERTAIN']);

export function makePoint(id,x,y,frameId,extra={}){return {id,type:'point',geometry:{x,y},frameId,...extra};}
export function makeSegment(id,a,b,frameId,extra={}){return {id,type:'segment',geometry:{a:{x:a.x,y:a.y},b:{x:b.x,y:b.y}},frameId,...extra};}
export function makeProvenance(kind,details={}){
  if(!PROVENANCE_KINDS.includes(kind))throw new Error(`Unknown provenance kind: ${kind}`);
  return {kind,...details};
}
export function makeResult({source,coordinateFrames,transformations=[],objects=[],relations=[],constraints=[],provenance=[],validationReport={status:'NOT_RUN',checks:[]},uncertainties=[],limitations=[],domainData={}}){
  return {schemaVersion:RESULT_SCHEMA_VERSION,source,coordinateFrames,transformations,objects,relations,constraints,provenance,validationReport,uncertainties,limitations,domainData};
}
