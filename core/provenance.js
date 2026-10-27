import {PROVENANCE_KINDS,VALIDATION_STATES,makeProvenance} from './types.js';
export function validateProvenance(p){
  if(!p||!PROVENANCE_KINDS.includes(p.kind))throw new Error('Object provenance kind is missing or invalid.');
  if(p.confidence!==undefined&&p.confidence!==null&&(!Number.isFinite(p.confidence)||p.confidence<0||p.confidence>1))throw new Error('Confidence must be in [0,1] or null.');
  if(p.validationStatus!==undefined&&!VALIDATION_STATES.includes(p.validationStatus))throw new Error('Unknown provenance validation status.');
  if(p.kind==='human'&&typeof p.actor!=='string')throw new Error('Human provenance must name an actor or role.');
  if(p.kind==='algorithm'&&typeof p.method!=='string')throw new Error('Algorithm provenance must name the method.');
  return true;
}
export {makeProvenance};
